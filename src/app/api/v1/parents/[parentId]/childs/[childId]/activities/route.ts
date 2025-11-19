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
    const dateParam = req.nextUrl.searchParams.get("date");

    if (!parentId || !childId) {
      return Res.badRequest({ message: "parentId and childId are required" });
    }

    let startDate: Date, endDate: Date;

    if (dateParam) {
      const date = new Date(dateParam);
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // 12:00 AM

      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // 11:59:59 PM
    } else {
      // default: today
      const today = new Date();
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter = { gte: startDate, lte: endDate };

    const weekEnd = new Date(); // today
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekEnd.getDate() - 6); // include today + past 6 days
    weekStart.setHours(0, 0, 0, 0);

    // ✅ New 7-day range variable
    const weekFilter = { gte: weekStart, lte: weekEnd };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Sleep activities
    const sleeps = await prisma.babySleep.findMany({
      where: {
        parentId,
        childId,
        // sleepTime: dateFilter,
        AND: [
          { sleepTime: { lt: endOfDay } },
          {
            OR: [
              { awakeTime: { gt: startOfDay } },
              { awakeTime: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        sleepType: true,
        sleepTime: true,
        awakeTime: true,
        duration: true,
        activityId: true,
        createdAt: true,
      },
      orderBy: { sleepTime: "asc" },
    });

    const totalNightSleep = sleeps
      .filter(s => s.sleepType === "NIGHT")
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const totalNapSleep = sleeps
      .filter(s => s.sleepType === "NAP")
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const sleepSummary = {
      totalNightSleep,
      totalNapSleep,
      totalSleepMinutes: totalNightSleep + totalNapSleep,
    };

    // 2️⃣ Temperature activities
    const temperatures = await prisma.activity.findMany({
      where: {
        parentId,
        childId,
        type: "TEMPERATURE",
        createdAt: weekFilter,
      },
      select: {
        temperature: { select: { temperature: true, date: true }, orderBy: { date: "desc" } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    // 3️⃣ Feed activities
    const feeds = await prisma.activity.findMany({
      where: {
        parentId,
        childId,
        type: "FEED",
        feedTime: dateFilter,
      },
      select: {
        id: true,
        feedType: true,
        feedName: true,
        feedAmount: true,
        feedTime: true,
        createdAt: true,
      },
      orderBy: { feedTime: "asc" },
    });

    const schedules = await prisma.feedSchedule.findMany({
      where: { parentId, childId },
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
              where: { feedTime: dateFilter },
              select: {
                id: true,
                type: true,
                feedAmount: true,
                feedType: true,
                feedTime: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return Res.success({
      message: "Activities fetched successfully",
      data: {
        sleep: { sleeps, summary: sleepSummary },
        temperature: temperatures,
        feed: feeds,
        schedule: schedules
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return Res.serverError();
  }
}
