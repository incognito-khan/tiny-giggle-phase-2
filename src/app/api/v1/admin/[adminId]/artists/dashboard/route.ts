import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId: artistId } = await params;
    if (!artistId) return Res.badRequest({ message: "Please provide Artist ID" });

    // 1. Run all independent queries concurrently
    const [
      totalMusic,
      freeMusicCount,
      paidMusicCount,
      totalPurchases,
      musicPurchasesRaw,
      musicUploadsRaw,
      musicFavoritesRaw,
      totalRevenue
    ] = await Promise.all([
      prisma.music.count({ where: { uploadedById: artistId, isDeleted: false } }),
      prisma.music.count({ where: { uploadedById: artistId, type: "FREE", isDeleted: false } }),
      prisma.music.count({ where: { uploadedById: artistId, type: "PAID", isDeleted: false } }),
      prisma.purchasedMusic.count({ where: { music: { uploadedById: artistId }, isDeleted: false } }),
      prisma.purchasedMusic.groupBy({
        by: ["musicId"],
        where: { music: { uploadedById: artistId }, isDeleted: false },
        _count: { id: true },
      }),
      prisma.music.findMany({
        where: { uploadedById: artistId, isDeleted: false },
        select: { createdAt: true },
      }),
      prisma.music.findMany({
        where: { uploadedById: artistId, isDeleted: false },
        select: { favorites: { select: { id: true } } },
      }),
      prisma.purchasedMusic.findMany({ where: { music: { uploadedById: artistId, type: "PAID" }, isDeleted: false }, select: { music: true } })
    ]);

    const totalEarnings = totalRevenue.reduce((sum, item) => sum + item.music.price, 0);

    // 2. Total favorites
    const totalFavorites = musicFavoritesRaw.reduce((sum, music) => sum + music.favorites.length, 0);

    // 3. Revenue per music (PAID only)
    const revenuePerMusic = await Promise.all(
      musicPurchasesRaw.map(async (item) => {
        const music = await prisma.music.findUnique({
          where: { id: item.musicId },
          select: { title: true, price: true, type: true },
        });
        if (!music || music.type !== "PAID") return null;
        const purchases = item._count.id || 0;
        return {
          musicId: item.musicId,
          title: music.title,
          purchases,
          revenue: (music.price || 0) * purchases,
        };
      })
    );
    
    // Filter out nulls in case some music is FREE
    const revenuePerMusicFiltered = revenuePerMusic.filter(Boolean);

    // 4. Monthly uploads grouped by date
    const monthlyUploads = musicUploadsRaw.reduce((acc, music) => {
      const date = music.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const existing = acc.find((d) => d.date === date);
      if (existing) existing.count += 1;
      else acc.push({ date, count: 1 });
      return acc;
    }, [] as { date: string; count: number }[]);

    return Res.ok({
      message: "Artist dashboard data fetched successfully",
      data: {
        totalMusic,
        freeMusicCount,
        paidMusicCount,
        totalPurchases,
        totalFavorites,
        revenuePerMusic: revenuePerMusicFiltered,
        monthlyUploads,
        totalEarnings
      },
    });
  } catch (error) {
    console.error(error);
    return Res.serverError({ message: "Failed to fetch artist dashboard data" });
  }
}
