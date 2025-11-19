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

    let where: any = { parentId, childId };

    if (dateParam) {
      const date = new Date(dateParam);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      where.sleepTime = {
        gte: date,
        lt: nextDate,
      };
    }

    const sleeps = await prisma.babySleep.findMany({
      where,
      select: {
        id: true,
        sleepType: true,
        sleepTime: true,
        awakeTime: true,
        activityId: true,
        duration: true,
        createdAt: true
      },
      orderBy: { sleepTime: "asc" },
    });

    const totalNightSleep = sleeps
      .filter(s => s.sleepType === "NIGHT")
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const totalNapSleep = sleeps
      .filter(s => s.sleepType === "NAP")
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const summary = {
      totalNightSleep,
      totalNapSleep,
      totalSleepMinutes: totalNightSleep + totalNapSleep,
    };

    return Res.success({ message: "Daily sleep summary fetched", data: { sleeps, summary } });
  } catch (error) {
    console.error("Error fetching sleep summary:", error);
    return Res.serverError();
  }
}
