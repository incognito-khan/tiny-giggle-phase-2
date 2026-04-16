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

    // Check reel exists
    const reel = await prisma.reel.findUnique({ where: { id: reelId } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    // Toggle like
    const existing = await prisma.reelLike.findUnique({
      where: { reelId_userId: { reelId, userId } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.reelLike.delete({
        where: { reelId_userId: { reelId, userId } },
      });
      liked = false;
    } else {
      await prisma.reelLike.create({
        data: { reelId, userId, userType: mappedRole },
      });
      liked = true;
    }

    const likeCount = await prisma.reelLike.count({ where: { reelId } });

    return NextResponse.json({
      data: { liked, likeCount },
      message: liked ? "Reel liked" : "Reel unliked",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to toggle like: ${err}` },
      { status: 500 },
    );
  }
}
