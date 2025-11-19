import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId } = await params;

    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required" });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim();

    const whereClause: any = { isDeleted: false };

    // 🔍 If search exists, filter by order tracking number or product name
    if (search) {
      whereClause.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        // { shippingAddress: { contains: search, mode: "insensitive" } },
        {
          orderItems: {
            some: {
              product: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        trackingNumber: true,
        shippingAddress: true,
        totalPrice: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        orderItems: {
          where: { isDeleted: false },
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Res.ok({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Res.serverError();
  }
}
