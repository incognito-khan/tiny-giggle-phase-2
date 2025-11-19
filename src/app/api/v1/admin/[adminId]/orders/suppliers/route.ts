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

    // Base: orders that include at least one product listed by this admin/supplier
    const baseWhere: any = {
      isDeleted: false,
      orderItems: {
        some: {
          product: { listedById: adminId },
        },
      },
    };

    // If search is present, require that either trackingNumber matches
    // OR there's an orderItem with product name matching (and listedById still enforced).
    const searchWhere: any[] = [];
    if (search) {
      searchWhere.push({ trackingNumber: { contains: search, mode: "insensitive" } });

      // Match orders where some orderItem's product (belonging to this supplier) matches name
      searchWhere.push({
        orderItems: {
          some: {
            product: {
              listedById: adminId,
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
      });
    }

    const finalWhere = search && searchWhere.length
      ? { AND: [baseWhere, { OR: searchWhere }] }
      : baseWhere;

    const orders = await prisma.order.findMany({
      where: finalWhere,
      select: {
        id: true,
        trackingNumber: true,
        shippingAddress: true,
        totalPrice: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        orderItems: {
          // return only order items that belong to this supplier
          where: {
            product: {
              listedById: adminId,
              ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
            },
          },
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
      orderBy: { createdAt: "desc" },
    });

    return Res.ok({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching supplier orders:", error);
    return Res.serverError();
  }
}
