import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/helpers/s3";
import { prepareUser } from "@/lib/prepare-user";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

export async function GET(req: NextRequest) {
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

    const reels = await prisma.reel.findMany({
      where: {
        isDeleted: false,
        visibility: "PUBLIC",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        likes: { select: { userId: true } },
        saves: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const reelsWithSignedUrls = await Promise.all(
      reels.map(async (reel) => {
        let creator = null;
        if (reel.createdByType === "PARENT") {
          creator = await prisma.parent.findUnique({
            where: { id: reel.createdById },
            select: { id: true, name: true, profilePicture: true },
          });
        } else if (reel.createdByType === "ADMIN") {
          creator = await prisma.admin.findUnique({
            where: { id: reel.createdById },
            select: { id: true, name: true, profilePicture: true },
          });
        } else if (reel.createdByType === "RELATIVE") {
          creator = await prisma.childRelation.findUnique({
            where: { id: reel.createdById },
            select: { id: true, name: true, profilePicture: true },
          });
        }

        const preparedCreator = creator ? await prepareUser(creator, reel.createdByType.toLowerCase()) : null;


        const key = reel.videoUrl.includes("amazonaws.com")
          ? reel.videoUrl.split(".amazonaws.com/")[1]
          : reel.videoUrl;

        const thumbKey = reel.thumbnailUrl
          ? reel.thumbnailUrl.includes("amazonaws.com")
            ? reel.thumbnailUrl.split(".amazonaws.com/")[1]
            : reel.thumbnailUrl
          : null;

        const liked = reel.likes.some((l) => l.userId === userId);
        const saved = reel.saves.some((s) => s.userId === userId);

        // Remove relations from spread to clean up response
        const { likes, saves, _count, ...reelData } = reel as any;

        return {
          ...reelData,
          videoUrl: await getPresignedUrl(key),
          thumbnailUrl: thumbKey ? await getPresignedUrl(thumbKey) : null,
          createdBy: preparedCreator,
          liked,
          saved,
          likeCount: reel._count.likes,
          commentCount: reel._count.comments,
          shareCount: reel.shareCount || 0,
        };
      }),
    );

    return NextResponse.json({
      data: reelsWithSignedUrls,
      message: "Reels fetched successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch reels: ${err}` },
      { status: 500 },
    );
  }
}
