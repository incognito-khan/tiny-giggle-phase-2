import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId } = await params;
        if (!parentId) {
            return Res.badRequest({ message: "Parent ID is required" });
        }

        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
        });
        if (!parent) {
            return Res.notFound({ message: "Parent not found" });
        }

        const { name, subject, message, status, priority, email } = await req.json()

        const query = await prisma.query.create({
            data: {
                name,
                email,
                subject,
                message,
                status: status || "PENDING",
                priority: priority || "LOW",
                parentId
            },
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
        })

        return Res.created({ message: "Query Created Successfully", data: query })
    } catch (error) {
        console.error(error);
        return Res.serverError({ message: "Internal Server Error" });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId } = await params;
        if (!parentId) {
            return Res.badRequest({ message: "Parent ID is required" });
        }

        const queries = await prisma.query.findMany({
            where: { parentId },
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
        })

        return Res.ok({ message: "Queries Fetched Successfully", data: queries })
    } catch (error) {
        console.error(error);
        return Res.serverError({ message: "Internal Server Error" });
    }
}