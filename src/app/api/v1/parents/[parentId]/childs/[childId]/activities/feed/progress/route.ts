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
    const scheduleId = req.nextUrl.searchParams.get("scheduleId");

    if (!parentId || !childId || !scheduleId) {
      return Res.badRequest({ message: "parentId, childId, and scheduleId are required" });
    }

    // Fetch the schedule with its feed slots and linked activities
    const schedule = await prisma.feedSchedule.findUnique({
      where: { id: scheduleId },
      include: { feedSlots: { include: { activity: true } } },
    });

    if (!schedule) return Res.badRequest({ message: "No schedule found" });

    // Define today for filtering activities
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Map slots and mark which activities belong to today
    const slotsToday = schedule.feedSlots.map(slot => {
      const activityToday =
        slot.activity?.feedTime &&
        slot.activity.feedTime >= today &&
        slot.activity.feedTime < tomorrow
          ? slot.activity
          : null;

      return { ...slot, activity: activityToday };
    });

    const totalPlanned = slotsToday.length;
    const totalTaken = slotsToday.filter(s => s.activity).length;
    const totalAmount = slotsToday.reduce((sum, s) => sum + (s.activity?.feedAmount ?? 0), 0);

    return Res.success({
      message: "Today’s feed progress",
      data: {
        scheduleId: schedule.id,
        title: schedule.title,
        date: schedule.date,
        totalPlanned,
        totalTaken,
        totalAmount,
        slots: slotsToday,
      },
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
