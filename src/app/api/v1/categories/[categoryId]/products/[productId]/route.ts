import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string; productId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { categoryId, productId } = await params;
    if (!categoryId || !productId) {
      return Res.badRequest({ message: "Category or product id is invalid" });
    }

    const checkProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { isDeleted: true }
    });

    if (!checkProduct || checkProduct.isDeleted) {
      return Res.badRequest({ message: "Product Not Found" })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        quantity: true,
        costPrice: true,
        salePrice: true,
        taxPercent: true,
        listedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
    return Res.success({
      message: "Single product fetch successfully",
      data: product,
    });
  } catch (error) {
    return Res.serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { productId } = await params;

    if (!productId) {
      return Res.badRequest({ message: "Product ID is required" });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      return Res.notFound({ message: "Product not found" });
    }

    // Find all OrderItems for this product
    // const orderItems = await prisma.orderItem.findMany({
    //   where: { productId },
    //   select: { id: true, orderId: true },
    // });

    // const orderIdsToCheck = new Set<string>();

    // // Collect all related OrderIds
    // orderItems.forEach(item => orderIdsToCheck.add(item.orderId));

    // // Delete the OrderItems
    // await prisma.orderItem.deleteMany({
    //   where: { productId },
    // });

    // // For each Order, check if it has any remaining OrderItems
    // for (const orderId of orderIdsToCheck) {
    //   const remainingItems = await prisma.orderItem.count({
    //     where: { orderId },
    //   });

    //   if (remainingItems === 0) {
    //     // Delete the order if no items remain
    //     await prisma.order.delete({
    //       where: { id: orderId },
    //     });
    //   }
    // }

    // Delete the product
    await prisma.product.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return Res.success({
      message: "Product and related empty orders deleted successfully",
      data: productId,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string; categoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { productId, categoryId } = await params;

    if (!productId) {
      return Res.badRequest({ message: "Product ID is required" });
    }

    if (!categoryId) {
      return Res.badRequest({ message: "Category ID is required" });
    }

    const { name, slug, image, quantity, costPrice, salePrice, taxPercent, subCategoryId } = await req.json();

    if (!subCategoryId) {
      return Res.badRequest({ message: "Sub Category ID is required" });
    }

    if (!name || !slug || !quantity || !salePrice) {
      return Res.badRequest({ message: "All fields are required" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return Res.notFound({ message: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { name, slug, image, quantity, costPrice, salePrice, taxPercent, subCategoryId, categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        listedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });

    return Res.success({
      message: "Product updated successfully",
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        image: updatedProduct.image,
        costPrice: updatedProduct.costPrice,
        salePrice: updatedProduct.salePrice,
        quantity: updatedProduct.quantity,
        taxPercent: updatedProduct.taxPercent,
        category: updatedProduct.category,
        subCategory: updatedProduct.subCategory,
        listedBy: updatedProduct.listedBy
      },
    });

  } catch (error) {
    return Res.serverError();
  }
}

