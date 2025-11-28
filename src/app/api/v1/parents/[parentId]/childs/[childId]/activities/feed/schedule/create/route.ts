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

    if (!parentId) return Res.badRequest({ message: "Parent ID is required" });
    if (!childId) return Res.badRequest({ message: "Child ID is required" });

    const body = await req.json();
    const { title, date, feeds, repeatDaily } = body;

    // Validation
    if (!title || !date || !feeds || !Array.isArray(feeds) || feeds.length === 0) {
      return Res.badRequest({ message: "title, date and feeds[] are required" });
    }

    // Create FeedSchedule with slots
    const schedule = await prisma.feedSchedule.create({
      data: {
        title,
        parentId,
        childId,
        date: new Date(date),
        feedSlots: {
          create: feeds.map((f: any) => ({
            feedTime: new Date(f.feedTime),
            feedType: f.feedType,
            feedName: f.feedName,
            amount: parseFloat(f.amount),
          })),
        },
        inUsed: false,
        repeatDaily: repeatDaily ?? true
      },
      select: {
        id: true,
        title: true,
        date: true,
        createdAt: true,
        inUsed: true,
        feedSlots: {
          select: {
            id: true,
            feedTime: true,
            feedType: true,
            feedName: true,
            amount: true
          }
        }
      }
    });

    return Res.created({ message: "Feed schedule created", data: schedule });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
