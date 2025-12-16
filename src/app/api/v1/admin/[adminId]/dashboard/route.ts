import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId } = await params;
    if (!adminId) return Res.badRequest({ message: "Please provide Admin ID" });

    // Run independent counts/aggregations in parallel
    const [
      // Users
      totalParents,
      totalChildren,

      // Artists
      totalArtists,
      activeArtists,
      totalMusic,
      totalPaidMusic,
      totalFreeMusic,
      purchasedMusicRaw,

      // Suppliers & Products
      totalSuppliers,
      activeSuppliers,
      totalProducts,
      lowStockProducts,

      // Orders
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      monthlyOrdersRaw,

      // Milestones
      totalMilestones,

      // Vaccinations
      totalVaccinations,
    ] = await Promise.all([
      prisma.parent.count({ where: { isDeleted: false } }),
      prisma.child.count({ where: { isDeleted: false } }),

      prisma.artist.count({ where: { isDeleted: false } }),
      prisma.artist.count({ where: { isDeleted: false, status: "ACTIVE" } }),
      prisma.music.count({ where: { isDeleted: false } }),
      prisma.music.count({ where: { isDeleted: false, type: "PAID" } }),
      prisma.music.count({ where: { isDeleted: false, type: "FREE" } }),
      prisma.purchasedMusic.findMany({
        where: { isDeleted: false },
        select: {
          music: { select: { price: true, title: true, id: true } },
        },
      }),

      prisma.supplier.count({ where: { isDeleted: false } }),
      prisma.supplier.count({ where: { isDeleted: false, status: "ACTIVE" } }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { isDeleted: false, quantity: { lte: 5 } } }),

      prisma.order.count({ where: { isDeleted: false } }),
      prisma.order.count({ where: { isDeleted: false, orderStatus: "PENDING" } }),
      prisma.order.count({ where: { isDeleted: false, orderStatus: "DELIVERED" } }),
      prisma.order.count({ where: { isDeleted: false, orderStatus: "CANCELLED" } }),
      prisma.order.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),

      prisma.subMilestone.count(),
      prisma.vaccination.count(),
    ]);

    // Calculate revenue & purchases per music for charts
    const revenuePerMusicMap: Record<string, { title: string; revenue: number }> = {};
    purchasedMusicRaw.forEach((p) => {
      if (!p.music) return;
      if (!revenuePerMusicMap[p.music.id]) revenuePerMusicMap[p.music.id] = { title: p.music.title, revenue: 0 };
      revenuePerMusicMap[p.music.id].revenue += p.music.price || 0;
    });
    const revenuePerMusic = Object.entries(revenuePerMusicMap).map(([musicId, data]) => ({ musicId, ...data }));

    // Prepare monthly orders for chart
    const monthlyOrders = monthlyOrdersRaw.map((m) => ({
      date: m.createdAt.toISOString().split("T")[0],
      count: m._count.id,
    }));

    // Build response
    return Res.ok({
      message: "Admin dashboard data fetched successfully",
      data: {
        users: { totalParents, totalChildren },

        artists: {
          totalArtists,
          activeArtists,
          totalMusic,
          totalPaidMusic,
          totalFreeMusic,
          totalPurchases: purchasedMusicRaw.length,
          totalEarnings: revenuePerMusic.reduce((sum, m) => sum + m.revenue, 0),
          revenuePerMusic,
        },

        suppliers: {
          totalSuppliers,
          activeSuppliers,
          totalProducts,
          lowStockProducts,
        },

        orders: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          monthlyOrders,
        },

        milestones: {
          totalMilestones,
        },

        vaccinations: {
          totalVaccinations,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return Res.serverError({ message: "Failed to fetch admin dashboard data" });
  }
}
