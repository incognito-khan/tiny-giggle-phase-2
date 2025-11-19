import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Admin ID is required" });
        }

        const url = new URL(req.url);
        const search = url.searchParams.get("search")?.trim();

        const whereClause: any = {};
        if (search) {
            whereClause.OR = [
                { subject: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        const queries = await prisma.query.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                subject: true,
                message: true,
                status: true,
                priority: true,
                createdAt: true,
                parent: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return Res.ok({ message: "Queries fetched successfully", data: queries });
    } catch (error) {
        console.error(error);
        return Res.serverError({ message: "Internal Server Error" });
    }
}