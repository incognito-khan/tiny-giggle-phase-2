import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { ReelUserType } from "@prisma/client";

const roleMap: Record<string, ReelUserType> = {
  parent: ReelUserType.PARENT,
  admin: ReelUserType.ADMIN,
  relative: ReelUserType.RELATIVE,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const result = await verifyAccessTokenFromRequest(req);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const userId = result.data.id;
    const userRole = result.data.role;
    const mappedRole = roleMap[userRole];

    if (!mappedRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reelId = id;

    const reel = await prisma.reel.findUnique({ where: { id: reelId } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const existing = await prisma.reelSave.findUnique({
      where: { reelId_userId: { reelId, userId } },
    });

    let saved: boolean;
    if (existing) {
      await prisma.reelSave.delete({
        where: { reelId_userId: { reelId, userId } },
      });
      saved = false;
    } else {
      await prisma.reelSave.create({
        data: { reelId, userId, userType: mappedRole },
      });
      saved = true;
    }

    return NextResponse.json({
      data: { saved },
      message: saved ? "Reel saved" : "Reel unsaved",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to toggle save: ${err}` },
      { status: 500 },
    );
  }
}
