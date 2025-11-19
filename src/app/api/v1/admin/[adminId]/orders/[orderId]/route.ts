import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; orderId: string; }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, orderId } = await params;
    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required" });
    }

    if (!orderId) {
      return Res.badRequest({ message: "Order ID is required" });
    }

    const { orderStatus, paymentStatus }: { orderStatus?: string; paymentStatus?: string; } = await req.json();

    if (!orderStatus && !paymentStatus) {
      return Res.badRequest({ message: "At least one field (orderStatus or paymentStatus) is required to update" });
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: updateData,
      select: {
        id: true,
        trackingNumber: true,
        shippingAddress: true,
        totalPrice: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        parentId: true,
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
        }
      }
    });

    return Res.ok({ message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    console.error(error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; orderId: string; }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, orderId } = await params;
    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required" });
    }

    if (!orderId) {
      return Res.badRequest({ message: "Order ID is required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.isDeleted) {
      return Res.notFound({ message: "Order not found" });
    }

    await prisma.orderItem.updateMany({
      where: {
        orderId: orderId,
        isDeleted: false
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return Res.ok({ message: "Order deleted successfully", data: orderId });
  } catch (error) {
    return Res.serverError();
  }
}