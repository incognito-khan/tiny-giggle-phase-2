import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const categories = await prisma.musicCategory.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        status: true,
        // _count: {
        //   select: { musics: true },
        // },
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            createdAt: true,
            // _count: {
            //   select: { music: true },
            // },
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const categoryIds = categories.map(c => c.id);
    const subCategoryIds = categories.flatMap(c => c.subCategories.map(s => s.id));

    // Step 3: Get non-deleted music counts for both
    const [categoryCounts, subCategoryCounts] = await Promise.all([
      prisma.music.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        where: { isDeleted: false, categoryId: { in: categoryIds } },
      }),
      prisma.music.groupBy({
        by: ["subCategoryId"],
        _count: { id: true },
        where: { isDeleted: false, subCategoryId: { in: subCategoryIds } },
      }),
    ]);

    // Step 4: Build maps for quick lookup
    const categoryCountMap = Object.fromEntries(
      categoryCounts.map(c => [c.categoryId, c._count.id])
    );

    const subCategoryCountMap = Object.fromEntries(
      subCategoryCounts.map(s => [s.subCategoryId, s._count.id])
    );

    // Step 5: Merge counts back into the categories
    const result = categories.map(cat => ({
      ...cat,
      _count: { musics: categoryCountMap[cat.id] || 0 },
      subCategories: cat.subCategories.map(sub => ({
        ...sub,
        _count: { musics: subCategoryCountMap[sub.id] || 0 },
      })),
    }));


    return Res.success({
      message: "Music Categories fetch successfully",
      data: result,
    });
  } catch (error) {
    return Res.serverError();
  }
}