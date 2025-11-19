import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { categoryId } = await params;
    if (!categoryId) {
      return Res.badRequest({ message: "Category id is invalid" });
    }

    const checkCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { isDeleted: true }
    });

    if (!checkCategory || checkCategory.isDeleted) {
      return Res.badRequest({ message: "Category Not Found" })
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
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
    });

    const [categoryCount, subCategoryCounts] = await Promise.all([
      prisma.product.count({
        where: { categoryId, isDeleted: false },
      }),
      prisma.product.groupBy({
        by: ["subCategoryId"],
        _count: { id: true },
        where: {
          isDeleted: false,
          subCategoryId: {
            in: category.subCategories.map(sub => sub.id),
          },
        },
      }),
    ]);

    // Step 3: Map subcategory counts
    const subCountMap = Object.fromEntries(
      subCategoryCounts.map(s => [s.subCategoryId, s._count.id])
    );

    // Step 4: Merge counts
    const result = {
      ...category,
      _count: { products: categoryCount },
      subCategories: category.subCategories.map(sub => ({
        ...sub,
        _count: { products: subCountMap[sub.id] || 0 },
      })),
    };

    return Res.success({
      message: "Category fetch successfully",
      data: result,
    });
  } catch (error) {
    return Res.serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { categoryId } = await params;

    if (!categoryId) {
      return Res.badRequest({ message: "Category ID is required" });
    }

    // Check if product exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (existingCategory) {
      const categoryProducts = await prisma.product.findMany({
        where: { categoryId: categoryId, isDeleted: false },
      });
      const subCategories = await prisma.subCategory.findMany({
        where: { parentId: categoryId, isDeleted: false }
      })

      if (subCategories.length > 0) {
        await prisma.subCategory.updateMany({
          where: { parentId: categoryId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        })
      }

      if (categoryProducts.length > 0) {
        await prisma.product.updateMany({
          where: { categoryId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          },
        });
      }

      // Delete the category
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      return Res.success({
        message: "Category deleted successfully",
        data: categoryId
      });
    }

    const existingMusicCategory = await prisma.musicCategory.findUnique({
      where: { id: categoryId },
    });

    if (existingMusicCategory) {
      const categoryMusic = await prisma.music.findMany({
        where: { categoryId: categoryId, isDeleted: false },
      });

      const subCategories = await prisma.muiscSubCategory.findMany({
        where: { parentId: categoryId, isDeleted: false }
      })

      if (subCategories.length > 0) {
        await prisma.muiscSubCategory.updateMany({
          where: { parentId: categoryId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        })
      }

      if (categoryMusic.length > 0) {
        await prisma.music.updateMany({
          where: { categoryId: categoryId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });
      }

      // Delete the category
      await prisma.musicCategory.update({
        where: { id: categoryId },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      return Res.success({
        message: "Category deleted successfully",
        data: categoryId
      });
    }

    if ((!existingCategory || existingCategory.isDeleted) && (!existingMusicCategory || existingMusicCategory.isDeleted)) {
      return Res.notFound({ message: "Category not found" });
    }


  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { categoryId } = await params;

    if (!categoryId) {
      return Res.badRequest({ message: "Category ID is required" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (existingCategory) {
      const { name, slug, status } = await req.json();

      if (!name || !slug || !status) {
        return Res.badRequest({ message: "Name, Status and Slug are required" });
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: { name, slug, status },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          _count: {
            select: { products: true }
          },
          createdAt: true,
          subCategories: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              createdAt: true,
              _count: {
                select: { products: true },
              },
            }
          }
        }
      });

      return Res.success({
        message: "Category updated successfully",
        data: updatedCategory
      });
    }

    const existingMusicCategory = await prisma.musicCategory.findUnique({
      where: { id: categoryId },
    });

    if (existingMusicCategory) {
      const { name, slug, status } = await req.json();
      if (!name || !slug || !status) {
        return Res.badRequest({ message: "Name, Status and Slug are required" });
      }
      const updatedCategory = await prisma.musicCategory.update({
        where: { id: categoryId },
        data: { name, slug, status },
        select: { id: true, name: true, slug: true, status: true, _count: { select: { musics: true } }, createdAt: true }
      });
      return Res.success({
        message: "Category updated successfully",
        data: updatedCategory
      });
    }

    if (!existingCategory && !existingMusicCategory) {
      return Res.notFound({ message: "Category not found" });
    }


  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}