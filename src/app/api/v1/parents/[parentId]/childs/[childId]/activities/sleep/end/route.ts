import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, childId } = await params;
    const body = await req.json();
    const { sleepId, awakeTime } = body;

    if (!sleepId || !awakeTime)
      return Res.badRequest({ message: "sleepId and awakeTime are required" });

    const sleep = await prisma.babySleep.findUnique({ where: { id: sleepId } });
    if (!sleep) return Res.badRequest({ message: "Sleep session not found" });

    // Calculate duration (in minutes)
    const duration = Math.round(
      (new Date(awakeTime).getTime() - new Date(sleep.sleepTime).getTime()) / (1000 * 60)
    );

    const updatedSleep = await prisma.babySleep.update({
      where: { id: sleepId },
      data: {
        awakeTime: new Date(awakeTime),
        duration,
      },
      select: {
        id: true,
        sleepType: true,
        sleepTime: true,
        awakeTime: true,
        activityId: true,
        duration: true,
        createdAt: true
      }
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sleeps = await prisma.babySleep.findMany({
      where: {
        parentId,
        childId,
        // sleepTime: { gte: startOfDay, lte: endOfDay },
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
        sleepType: true,
        duration: true,
      },
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

    return Res.success({
      message: "Sleep session ended", data: {
        updatedSleep,
        sleepSummary
      }
    });
  } catch (error) {
    console.error("Error ending sleep:", error);
    return Res.serverError();
  }
}
