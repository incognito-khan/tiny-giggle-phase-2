import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; milestoneId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, milestoneId } = await params;
        if (!adminId) return Res.badRequest({ message: "Admin ID is required" });
        if (!milestoneId) return Res.badRequest({ message: "Milestone ID is required" });

        const data = await req.json();

        const updatedMilestone = await prisma.milestone.update({
            where: { id: milestoneId },
            data,
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
        })

        return Res.success({ message: "Milestone updated successfully", data: updatedMilestone })
    } catch (error) {
        console.error("Update Milestone error:", error)
        return Res.serverError({ message: "Internal Server Error" })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; milestoneId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { milestoneId, adminId } = await params;
        if (!milestoneId) return Res.badRequest({ message: "Milestone ID is required" });
        if (!adminId) return Res.badRequest({ message: "Admin ID is required" })

        await prisma.subMilestone.deleteMany({
            where: { milestoneId }
        })

        await prisma.milestone.delete({
            where: { id: milestoneId }
        })

        return Res.ok({ message: "Deleted Successfully", data: milestoneId })
    } catch (error) {
        console.error("Delete Milestone error:", error)
        return Res.serverError({ message: "Internal Server Error" })
    }
}