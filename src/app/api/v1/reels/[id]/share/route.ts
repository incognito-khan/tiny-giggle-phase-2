import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const result = await verifyAccessTokenFromRequest(req);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const { id } = await params;
    const reelId = id;

    const reel = await prisma.reel.findUnique({ where: { id: reelId } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const updated = await prisma.reel.update({
      where: { id: reelId },
      data: { shareCount: { increment: 1 } },
      select: { shareCount: true },
    });

    return NextResponse.json({
      data: { shareCount: updated.shareCount },
      message: "Share count updated",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to update share count: ${err}` },
      { status: 500 },
    );
  }
}
