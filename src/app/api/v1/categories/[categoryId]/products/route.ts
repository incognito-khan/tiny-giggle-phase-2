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
      return Res.badRequest({
        message: "CategoryId is required",
      });
    }

    const products = await prisma.product.findMany({
      where: { categoryId, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        costPrice: true,
        salePrice: true,
        quantity: true,
        taxPercent: true,
        createdAt: true,
        updatedAt: true,
        listedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });

    return Res.success({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return Res.serverError();
  }
}