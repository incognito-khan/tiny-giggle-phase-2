import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, childId } = await params;

        if (!parentId || !childId) {
            return Res.badRequest({ message: "parentId and childId are required" });
        }

        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0); // 12:00 AM

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM

        // Latest Sleep activity
        const latestSleep = await prisma.babySleep.findFirst({
            where: { parentId, childId },
            orderBy: { sleepTime: "desc" },
            select: {
                id: true,
                sleepType: true,
                sleepTime: true,
                awakeTime: true,
                duration: true,
                activityId: true,
                createdAt: true,
            },
        });

        // Optional: calculate sleep summary for latest sleep
        const sleepSummary = latestSleep
            ? {
                totalNightSleep: latestSleep.sleepType === "NIGHT" ? latestSleep.duration || 0 : 0,
                totalNapSleep: latestSleep.sleepType === "NAP" ? latestSleep.duration || 0 : 0,
                totalSleepMinutes: latestSleep.duration || 0,
            }
            : null;

        // Latest Temperature activity
        const latestTemperature = await prisma.activity.findFirst({
            where: { parentId, childId, type: "TEMPERATURE" },
            orderBy: { createdAt: "desc" },
            select: {
                temperature: { select: { temperature: true, date: true } },
                createdAt: true,
            },
        });

        // Latest Feed activity
        const latestFeed = await prisma.activity.findMany({
            where: {
                parentId,
                childId,
                type: "FEED",
                feedTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: { feedTime: "desc" },
            select: {
                id: true,
                feedType: true,
                feedName: true,
                feedAmount: true,
                feedTime: true,
                createdAt: true,
            },
        });

        // Latest Schedule with latest feed slot & activity
        const latestSchedule = await prisma.feedSchedule.findFirst({
            where: { parentId, childId, inUsed: true },
            orderBy: { createdAt: "desc" },
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
                            where: { parentId, childId },
                            select: {
                                id: true,
                                type: true,
                                feedAmount: true,
                                feedType: true,
                                feedName: true,
                                feedTime: true,
                            },
                        },
                    },
                    orderBy: { feedTime: "desc" },
                },
            },
        });

        return Res.success({
            message: "Latest activities fetched successfully",
            data: {
                sleep: latestSleep ? { ...latestSleep, summary: sleepSummary } : null,
                temperature: latestTemperature,
                feed: latestFeed,
                schedule: latestSchedule,
            },
        });
    } catch (error) {
        console.error("Error fetching latest activities:", error);
        return Res.serverError({ message: "Failed to fetch latest activities" });
    }
}
