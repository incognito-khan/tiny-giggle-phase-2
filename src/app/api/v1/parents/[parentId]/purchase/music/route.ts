import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string) {
  const key = url.includes("amazonaws.com")
    ? url.split(".amazonaws.com/")[1]
    : url;

  return getPresignedUrl(key);
}

async function signMusicUrls(music: any[]) {
  return Promise.all(
    music.map(async (item) => ({
      ...item,
      music: {
        ...item.music,
        url: item.music.url ? await signUrl(item.music.url) : null,
        thumbnail: item.music.thumbnail
          ? await signUrl(item.music.thumbnail)
          : null,
      },
    })),
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; musicId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId } = await params;

    if (!parentId) {
      return Res.badRequest({ message: "User ID is required!" });
    }

    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (existingParent) {
      const music = await prisma.purchasedMusic.findMany({
        where: { parentId, isDeleted: false },
        select: {
          id: true,
          purchasedAt: true,
          music: {
            select: {
              id: true,
              title: true,
              mimeType: true,
              url: true,
              size: true,
              type: true,
              price: true,
              thumbnail: true,
              uploadedBy: {
                select: { id: true, name: true, email: true },
              },
              category: {
                select: { id: true, name: true },
              },
              subCategory: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const signedMusic = await signMusicUrls(music);

      return Res.ok({
        message: "Purchased Music Fetched Successfully",
        data: signedMusic,
      });
    }

    const existingRelative = await prisma.childRelation.findUnique({
      where: { id: parentId },
    });

    if (existingRelative) {
      const music = await prisma.purchasedMusic.findMany({
        where: { relativeId: parentId, isDeleted: false },
        select: {
          id: true,
          purchasedAt: true,
          music: {
            select: {
              id: true,
              title: true,
              mimeType: true,
              url: true,
              size: true,
              type: true,
              price: true,
              thumbnail: true,
              uploadedBy: {
                select: { id: true, name: true, email: true },
              },
              category: {
                select: { id: true, name: true },
              },
              subCategory: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const signedMusic = await signMusicUrls(music);

      return Res.ok({
        message: "Purchased Music Fetched Successfully",
        data: signedMusic,
      });
    }

    if (!existingParent && !existingRelative) {
      return Res.notFound({ message: "User not found" });
    }
  } catch (error) {
    console.error(error.message);
    return Res.serverError({ message: "Internal Server Error" });
  }
}
