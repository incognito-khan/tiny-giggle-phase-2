import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId } = await params;

        if (!parentId) {
            return Res.badRequest({
                message: "Parent ID is required",
            });
        }

        const url = new URL(req.url);
        const search = url.searchParams.get("search")?.trim();

        // Build where clause
        const whereClause: any = {
            listedById: parentId,
            isDeleted: false
        };

        if (search) {
            whereClause.name = { contains: search, mode: "insensitive" };
        }

        const products = await prisma.product.findMany({
            where: whereClause,
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
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                },
                subCategory: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                },
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