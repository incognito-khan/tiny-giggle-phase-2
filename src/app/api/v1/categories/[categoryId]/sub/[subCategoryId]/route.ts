import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subCategoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { subCategoryId } = await params;
    if (!subCategoryId) {
      return Res.badRequest({ message: "Sub Category Id is invalid" });
    }

    const check = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
      select: { isDeleted: true }
    });

    if (check || check.isDeleted) {
      return Res.badRequest({ message: "Sub Category Not Found" })
    };

    const subCategories = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true
      },
    });
    return Res.success({
      message: "Sub Category fetch successfully",
      data: subCategories,
    });
  } catch (error) {
    return Res.serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ subCategoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { subCategoryId } = await params;

    if (!subCategoryId) {
      return Res.badRequest({ message: "Sub Category ID is required" });
    }

    // Check if product exists
    const existingCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (existingCategory) {
      const categoryProducts = await prisma.product.findMany({
        where: { subCategoryId, isDeleted: false },
      });

      if (categoryProducts.length > 0) {
        await prisma.product.updateMany({
          where: { subCategoryId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });
      }

      // Delete the category
      await prisma.subCategory.update({
        where: { id: subCategoryId },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      return Res.success({
        message: "Sub Category deleted successfully",
        data: subCategoryId
      });
    }

    const existingMusicCategory = await prisma.muiscSubCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (existingMusicCategory) {
      const categoryMusic = await prisma.music.findMany({
        where: { subCategoryId: subCategoryId, isDeleted: false },
      });

      if (categoryMusic.length > 0) {
        await prisma.music.updateMany({
          where: { subCategoryId: subCategoryId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });
      }

      // Delete the category
      await prisma.muiscSubCategory.update({
        where: { id: subCategoryId },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      return Res.success({
        message: "Category deleted successfully",
        data: subCategoryId
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
  { params }: { params: Promise<{ subCategoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { subCategoryId } = await params;

    if (!subCategoryId) {
      return Res.badRequest({ message: "Sub Category ID is required" });
    }

    const existingCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (existingCategory) {
      const { name, slug, status } = await req.json();

      if (!name || !slug || !status) {
        return Res.badRequest({ message: "Name, Status and Slug are required" });
      }

      const updatedCategory = await prisma.subCategory.update({
        where: { id: subCategoryId },
        data: { name, slug, status },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          parentId: true,
          // _count: {
          //   select: { products: true }
          // },
          createdAt: true,
        }
      });

      const productCount = await prisma.product.count({
        where: { subCategoryId, isDeleted: false },
      });

      return Res.success({
        message: "Sub Category updated successfully",
        data: {
          ...updatedCategory,
          _count: {
            products: productCount,
          },
        },
      });
    }

    const existingMusicCategory = await prisma.muiscSubCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (existingMusicCategory) {
      const { name, slug, status } = await req.json();
      if (!name || !slug || !status) {
        return Res.badRequest({ message: "Name, Status and Slug are required" });
      }
      const updatedCategory = await prisma.muiscSubCategory.update({
        where: { id: subCategoryId },
        data: { name, slug, status },
        select: { id: true, name: true, slug: true, status: true, parentId: true, createdAt: true }
      });

      const musicCount = await prisma.music.count({
        where: { subCategoryId, isDeleted: false },
      });

      return Res.success({
        message: "Category updated successfully",
        data: {
          ...updatedCategory,
          _count: {
            music: musicCount,
          },
        },
      });
    }

    if (!existingCategory) {
      return Res.notFound({ message: "Category not found" });
    }


  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}