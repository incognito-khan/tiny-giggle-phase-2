import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string) {
  const key = url.includes("amazonaws.com")
    ? url.split(".amazonaws.com/")[1]
    : url;

  return getPresignedUrl(key);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId } = await params;

    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required." });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim();

    // Build where clause
    const whereClause: any = {
      uploadedById: adminId,
      isDeleted: false,
    };
    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    const musics = await prisma.music.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
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
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const musicsWithSignedUrls = await Promise.all(
      musics.map(async (music) => ({
        ...music,
        url: await signUrl(music.url),
        thumbnail: await signUrl(music.thumbnail),
      })),
    );

    return Res.success({
      message: "All music fetched successfully",
      data: musicsWithSignedUrls,
    });
  } catch (error) {
    console.error("Music fetch error:", error);
    return Res.serverError();
  }
}
