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
        if (!adminId) {
            return Res.badRequest({ message: "Please provide Supplier ID" });
        }

        // Run multiple independent queries concurrently
        const [
            totalProducts,
            totalOrders,
            orderItems,
            pendingOrders,
            completedOrders,
            inProgressOrders,
            cancelOrders,
            returnRequestOrders,
            returnedOrders,
            refundedOrders,
            failedOrders,
            totalQuantitySold,
            revenuePerProductRaw,
            monthlyOrdersRaw,
            pendingPayments,
            lowStockProducts,
        ] = await Promise.all([
            prisma.product.count({ where: { listedById: adminId, isDeleted: false } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, isDeleted: false } }),
            prisma.orderItem.findMany({
                where: { product: { listedById: adminId }, isDeleted: false, order: { paymentStatus: "COMPLETED" } },
                select: { quantity: true, product: { select: { salePrice: true } } },
            }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: "PENDING" } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: { in: ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] } } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: { in: ["CONFIRMED", "PROCESSING"] } } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: "CANCELLED" } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: "RETURN_REQUESTED" } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: "RETURNED" } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: "REFUNDED" } } }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { orderStatus: "FAILED" } } }),
            prisma.orderItem.aggregate({
                _sum: { quantity: true },
                where: { product: { listedById: adminId }, order: { paymentStatus: "COMPLETED" } },
            }),
            prisma.orderItem.groupBy({
                by: ["productId"],
                where: { product: { listedById: adminId }, order: { paymentStatus: "COMPLETED" } },
                _sum: { quantity: true },
            }),
            prisma.orderItem.findMany({
                where: { product: { listedById: adminId } },
                select: { createdAt: true },
            }),
            prisma.orderItem.count({ where: { product: { listedById: adminId }, order: { paymentStatus: "PENDING" } } }),
            prisma.product.count({ where: { listedById: adminId, quantity: { lte: 5 }, isDeleted: false } }),
        ]);

        const revenuePerProduct = await Promise.all(
            revenuePerProductRaw.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, salePrice: true },
                });
                const quantitySold = item._sum.quantity || 0;
                return {
                    productId: item.productId,
                    productName: product?.name || "",
                    quantitySold,
                    revenue: (product?.salePrice || 0) * quantitySold,
                };
            })
        );


        // Calculate total earnings
        const totalEarnings = orderItems.reduce((sum, item) => sum + item.quantity * item.product.salePrice, 0);

        // Average order value
        const avgOrderValue = totalOrders ? totalEarnings / totalOrders : 0;

        // Return rate
        const returnRate = totalOrders ? ((returnedOrders + refundedOrders) / totalOrders) * 100 : 0;

        // Transform monthly orders to group by date (YYYY-MM-DD)
        const monthlyOrders: { date: string; count: number }[] = monthlyOrdersRaw.reduce((acc, item) => {
            const date = item.createdAt.toISOString().split("T")[0];
            const existing = acc.find(d => d.date === date);
            if (existing) {
                existing.count += 1;
            } else {
                acc.push({ date, count: 1 });
            }
            return acc;
        }, [] as { date: string; count: number }[]);

        return Res.ok({
            message: "Supplier data fetched successfully",
            data: {
                totalProducts,
                totalOrders,
                totalEarnings,
                avgOrderValue,
                pendingOrders,
                inProgressOrders,
                completedOrders,
                cancelOrders,
                returnRequestOrders,
                returnedOrders,
                refundedOrders,
                failedOrders,
                pendingPayments,
                totalQuantitySold: totalQuantitySold._sum.quantity || 0,
                revenuePerProduct,
                monthlyOrders,
                lowStockProducts,
                returnRate,
            },
        });
    } catch (error) {
        console.error(error);
        return Res.serverError({ message: "Failed to fetch supplier data" });
    }
}
