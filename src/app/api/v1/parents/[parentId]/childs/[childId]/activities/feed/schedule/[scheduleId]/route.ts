import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; childId: string; scheduleId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, childId, scheduleId } = await params;

        if (!parentId || !childId || !scheduleId)
            return Res.badRequest({ message: "scheduleId, parentId, childId are required" });

        const inUsedSchedule = await prisma.feedSchedule.findFirst({
            where: { parentId, childId, inUsed: true },
            select: {
                id: true,
            }
        });

        if (inUsedSchedule) {
            await prisma.feedSchedule.update({
                where: { id: inUsedSchedule.id },
                data: { inUsed: false }
            });
        }

        const cuurentSchedule = await prisma.feedSchedule.update({
            where: { id: scheduleId },
            data: { inUsed: true },
            select: {
                id: true,
                title: true,
                date: true,
                repeatDaily: true,
                createdAt: true,
                inUsed: true,
                feedSlots: {
                    select: {
                        id: true,
                        feedTime: true,
                        feedType: true,
                        feedName: true,
                        amount: true,
                        activity: {
                            select: {
                                id: true,
                                type: true,
                                feedAmount: true,
                                feedType: true,
                                feedName: true,
                                feedTime: true
                            }
                        }
                    }
                }
            },
        })

        return Res.success({ message: "Feed schedule changed", data: cuurentSchedule });
    } catch (error) {
        console.error(error);
        return Res.serverError();
    }
}
