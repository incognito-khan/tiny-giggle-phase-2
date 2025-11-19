import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { categoryId } = await params;
        const musics = await prisma.music.findMany({
            where: { categoryId, isDeleted: false },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                mimeType: true,
                url: true,
                size: true,
                type: true,
                price: true,
                thumbnail: true,
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                categoryId: true,
                subCategory: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return Res.success({
            message: "All music fetched successfully",
            data: musics,
        });
    } catch (error) {
        console.error("Music fetch error:", error);
        return Res.serverError();
    }
}