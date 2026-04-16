import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedUploadUrl } from "@/lib/helpers/s3";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { ReelUserType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const result = await verifyAccessTokenFromRequest(req);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const userId = result.data.id;
    const userRole = result.data.role;

    console.log(userId, userRole, "userId, userRole");

    if (
      userRole !== "parent" &&
      userRole !== "admin" &&
      userRole !== "relative"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { fileName, mimeType, size } = body;

    // generate unique key
    const key = `reels/${Date.now()}-${fileName}`;

    const uploadUrl = await getSignedUploadUrl(key, mimeType);

    const roleMap: Record<string, ReelUserType> = {
      parent: ReelUserType.PARENT,
      admin: ReelUserType.ADMIN,
      relative: ReelUserType.RELATIVE,
    };

    const mappedRole = roleMap[userRole];

    if (!mappedRole) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    const upload = await prisma.reelUpload.create({
      data: {
        fileName,
        mimeType,
        size,
        createdById: userId,
        createdByType: mappedRole,
        uploadUrl,
        status: "INITIATED",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      data: {
        uploadId: upload.id,
        uploadUrl,
        key,
      },
      message: "Upload initiated successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
