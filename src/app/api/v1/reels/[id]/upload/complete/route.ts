import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicUrl } from "@/lib/helpers/s3";
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

    if (
      userRole !== "parent" &&
      userRole !== "admin" &&
      userRole !== "relative"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId, key, caption, visibility, thumbnailKey } =
      await req.json();

    if (
      !uploadId ||
      !key ||
      caption === undefined ||
      caption === null ||
      !visibility
    ) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }

    if (
      visibility !== "PUBLIC" &&
      visibility !== "PRIVATE" &&
      visibility !== "FAMILY_ONLY"
    ) {
      return NextResponse.json(
        { error: "Invalid visibility" },
        { status: 400 },
      );
    }
    const upload = await prisma.reelUpload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }

    const roleMap: Record<string, ReelUserType> = {
      parent: ReelUserType.PARENT,
      admin: ReelUserType.ADMIN,
      relative: ReelUserType.RELATIVE,
    };

    const mappedRole = roleMap[userRole];

    if (!mappedRole) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    // mark upload complete
    await prisma.reelUpload.update({
      where: { id: uploadId },
      data: { status: "COMPLETED" },
    });

    const videoUrl = getPublicUrl(key);
    const thumbnailUrl = thumbnailKey ? getPublicUrl(thumbnailKey) : null;

    const reel = await prisma.reel.create({
      data: {
        videoUrl,
        thumbnailUrl,
        caption,
        visibility,
        createdById: userId,
        createdByType: mappedRole,
        status: "PROCESSING",
      },
    });

    return NextResponse.json({
      data: {
        reelId: reel.id,
        status: reel.status,
      },
      message: "Upload completed successfully",
    });
  } catch (err) {
    return NextResponse.json({ error: "Complete failed" }, { status: 500 });
  }
}
