import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ milestoneId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { milestoneId } = await params;

        const milestones = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: {
                subMilestones: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        imageUrl: true
                    },
                },
            },
        });

        return Res.success({
            message: "Milestones fetched successfully",
            data: milestones,
        });
    } catch (error) {
        console.error(error);
        return Res.serverError();
    }
}