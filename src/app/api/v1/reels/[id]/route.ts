import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/helpers/s3";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reelId = id;
    const result = await verifyAccessTokenFromRequest(req);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const userId = result.data.id;
    const body = await req.json();
    const { caption, visibility } = body;

    // Verify ownership
    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
    });

    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    if (reel.createdById !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedReel = await prisma.reel.update({
      where: { id: reelId },
      data: {
        caption: caption !== undefined ? caption : reel.caption,
        visibility: visibility !== undefined ? visibility : reel.visibility,
      },
    });

    // Generate presigned URLs for the updated reel
    const key = updatedReel.videoUrl.includes("amazonaws.com")
      ? updatedReel.videoUrl.split(".amazonaws.com/")[1]
      : updatedReel.videoUrl;

    const thumbKey = updatedReel.thumbnailUrl
      ? updatedReel.thumbnailUrl.includes("amazonaws.com")
        ? updatedReel.thumbnailUrl.split(".amazonaws.com/")[1]
        : updatedReel.thumbnailUrl
      : null;

    const reelWithSignedUrls = {
      ...updatedReel,
      videoUrl: await getPresignedUrl(key),
      thumbnailUrl: thumbKey ? await getPresignedUrl(thumbKey) : null,
    };

    return NextResponse.json({
      data: reelWithSignedUrls,
      message: "Reel updated successfully",
    });
  } catch (err) {
    console.error("Update reel error:", err);
    return NextResponse.json(
      { error: "Failed to update reel" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reelId = id;
    const result = await verifyAccessTokenFromRequest(req);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const userId = result.data.id;

    // Verify ownership
    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
    });

    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    if (reel.createdById !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Soft delete
    await prisma.reel.update({
      where: { id: reelId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Reel deleted successfully",
    });
  } catch (err) {
    console.error("Delete reel error:", err);
    return NextResponse.json(
      { error: "Failed to delete reel" },
      { status: 500 },
    );
  }
}
