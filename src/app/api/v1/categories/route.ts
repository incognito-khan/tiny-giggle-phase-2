import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const { name, slug, adminId, status } = body;

    if (!name || !slug || !adminId || !status) {
      return Res.badRequest({ message: "Name, slug, status and adminId are required" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        adminId,
        status: status || "ACTIVE",
        isDeleted: false
      },
      // include: {
      //   _count: {
      //     select: { products: true },
      //   },
      // },
    });

    const productCount = await prisma.product.count({
      where: {
        categoryId: category.id,
        isDeleted: false,
      },
    });

    const categoryWithCount = {
      ...category,
      _count: {
        products: productCount,
      },
    };

    return Res.success({
      message: "Category created successfully",
      data: categoryWithCount,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return Res.error({
        message: "Slug already exists",
        status: 409,
      });
    }
    return Res.serverError();
  }
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        status: true,
        // _count: {
        //   select: { products: true },
        // },
        subCategories: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            createdAt: true,
            // _count: {
            //   select: { products: true },
            // },
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const categoryIds = categories.map(c => c.id);
    const subCategoryIds = categories.flatMap(c => c.subCategories.map(s => s.id));

    const [categoryCounts, subCategoryCounts] = await Promise.all([
      prisma.product.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        where: { isDeleted: false, categoryId: { in: categoryIds } },
      }),
      prisma.product.groupBy({
        by: ["subCategoryId"],
        _count: { id: true },
        where: { isDeleted: false, subCategoryId: { in: subCategoryIds } },
      }),
    ]);

    // Merge the counts
    const categoryCountMap = Object.fromEntries(
      categoryCounts.map(c => [c.categoryId, c._count.id])
    );
    const subCategoryCountMap = Object.fromEntries(
      subCategoryCounts.map(s => [s.subCategoryId, s._count.id])
    );

    const result = categories.map(cat => ({
      ...cat,
      _count: { products: categoryCountMap[cat.id] || 0 },
      subCategories: cat.subCategories.map(sub => ({
        ...sub,
        _count: { products: subCategoryCountMap[sub.id] || 0 },
      })),
    }));

    return Res.success({
      message: "Categories fetch successfully",
      data: result,
    });
  } catch (error) {
    console.error(error.message)
    return Res.serverError({ message: "Internal Server Error" });
  }
}
