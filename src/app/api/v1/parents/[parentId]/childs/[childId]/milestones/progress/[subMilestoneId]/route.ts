import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; childId: string; subMilestoneId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, childId, subMilestoneId } = await params;
        const body = await req.json();
        const { achieved, achievedAt, note } = body;

        if (!parentId) return Res.badRequest({ message: "Parent ID is required" });
        if (!childId) return Res.badRequest({ message: "Child ID is required" });
        if (!subMilestoneId) return Res.badRequest({ message: "Sub-Milestone ID is required" });
        if (typeof achieved !== "boolean")
            return Res.badRequest({ message: "Achieved must be true or false" });

        // Check if child exists under parent
        const child = await prisma.child.findFirst({
            where: { id: childId },
        });
        if (!child) return Res.notFound({ message: "Child not found under this parent" });

        // Check if progress record already exists
        const existing = await prisma.childMilestoneProgress.findFirst({
            where: { childId, subMilestoneId },
        });

        let progress;
        if (existing) {
            progress = await prisma.childMilestoneProgress.update({
                where: { id: existing.id },
                data: {
                    achieved,
                    achievedAt: achieved ? new Date(achievedAt) : null,
                    note: achieved ? note : null,
                },
            });
        } else {
            progress = await prisma.childMilestoneProgress.create({
                data: {
                    child: { connect: { id: childId } },
                    subMilestone: { connect: { id: subMilestoneId } },
                    parent: { connect: { id: parentId } },
                    achieved,
                    achievedAt,
                    note,
                },
            });
        }

        return Res.success({
            message: achieved
                ? "Sub-milestone marked as achieved"
                : "Sub-milestone marked as unachieved",
            data: {
                id: progress.id,
                achieved: progress.achieved,
                achievedAt: progress.achievedAt,
                note: progress.note,
                createdAt: progress.createdAt,
                subMilestoneId: progress.subMilestoneId
            },
        });
    } catch (error) {
        console.error("Progress update error:", error);
        return Res.serverError();
    }
}
