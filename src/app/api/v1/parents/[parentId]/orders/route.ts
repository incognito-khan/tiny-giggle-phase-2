import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required" });
    }

    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId }
    });

    if (existingParent) {
      const orders = await prisma.order.findMany({
        where: {
          parentId: parentId,
          isDeleted: false
        },
        select: {
          id: true,
          trackingNumber: true,
          shippingAddress: true,
          totalPrice: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
          orderItems: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  costPrice: true,
                  quantity: true,
                  image: true,
                }
              }
            }
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return Res.ok({ message: "Orders fetched successfully", data: orders });
    }

    const existingRelative = await prisma.childRelation.findUnique({
      where: { id: parentId }
    })

    if (existingRelative) {
      const orders = await prisma.order.findMany({
        where: {
          relativeId: parentId,
          isDeleted: false
        },
        select: {
          id: true,
          trackingNumber: true,
          shippingAddress: true,
          totalPrice: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
          orderItems: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  costPrice: true,
                  quantity: true,
                  image: true,
                }
              }
            }
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return Res.ok({ message: "Orders fetched successfully", data: orders });
    }

    if (!existingParent && !existingRelative) {
      return Res.badRequest({ message: "Invalid User!" })
    }

  } catch (error) {
    console.error(error)
    return Res.serverError({ message: "Internal Server Error" });
  }
}