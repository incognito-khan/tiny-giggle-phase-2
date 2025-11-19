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
    const { feedSlotId, actualTime } = body;

    if (!feedSlotId || !actualTime)
      return Res.badRequest({ message: "feedSlotId and actualTime are required" });

    // Fetch feed slot
    const slot = await prisma.feedSlot.findUnique({ where: { id: feedSlotId } });
    if (!slot) return Res.badRequest({ message: "Feed slot not found" });

    // Create Activity
    const activity = await prisma.activity.create({
      data: {
        type: "FEED",
        feedTime: new Date(actualTime),
        feedAmount: slot.amount,
        feedType: slot.feedType,
        feedName: slot.feedName,
        parentId,
        childId,
        feedSlot: { connect: { id: feedSlotId } },
      },
      select: {
        id: true,
        type: true,
        feedTime: true,
        feedType: true,
        feedName: true,
        feedAmount:true,
        feedSlot: {
          select: {
            id: true
          }
        }
      }
    });

    // Link Activity to FeedSlot
    await prisma.feedSlot.update({
      where: { id: feedSlotId },
      data: { activityId: activity.id },
    });

    return Res.created({ message: "Feed marked as taken", data: activity });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
