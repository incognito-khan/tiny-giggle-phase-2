import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, childId } = await params;
    const body = await req.json();
    const { sleepType, sleepTime } = body;

    if (!sleepType || !sleepTime)
      return Res.badRequest({ message: "sleepType and sleepTime are required" });

    // Find or create today's activity
    let activity = await prisma.activity.findFirst({
      where: {
        parentId,
        childId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          type: "SLEEP",
          parentId,
          childId,
        },
      });
    }

    // Create baby sleep record
    const babySleep = await prisma.babySleep.create({
      data: {
        sleepType,
        sleepTime: new Date(sleepTime),
        activityId: activity.id,
        parentId,
        childId,
      },
      select: {
        id: true,
        sleepType: true,
        sleepTime: true,
        awakeTime: true,
        duration: true,
        activityId: true,
        createdAt: true
      }
    });

    return Res.created({ message: "Sleep session started", data: babySleep });
  } catch (error) {
    console.error("Error starting sleep:", error);
    return Res.serverError();
  }
}
