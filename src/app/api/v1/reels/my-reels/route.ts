import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/helpers/s3";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { ReelUserType } from "@prisma/client";

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
        createdById: userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        caption: true,
        visibility: true,
        shareCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const reelsWithSignedUrls = await Promise.all(
      reels.map(async (reel) => {
        const key = reel.videoUrl.includes("amazonaws.com")
          ? reel.videoUrl.split(".amazonaws.com/")[1]
          : reel.videoUrl;

        const thumbKey = reel.thumbnailUrl
          ? reel.thumbnailUrl.includes("amazonaws.com")
            ? reel.thumbnailUrl.split(".amazonaws.com/")[1]
            : reel.thumbnailUrl
          : null;

        return {
          ...reel,
          videoUrl: await getPresignedUrl(key),
          thumbnailUrl: thumbKey ? await getPresignedUrl(thumbKey) : null,
          likeCount: reel._count.likes,
          commentCount: reel._count.comments,
        };
      }),
    );

    return NextResponse.json({
      data: reelsWithSignedUrls,
      message: "Reels fetched successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch reels" },
      { status: 500 },
    );
  }
}
