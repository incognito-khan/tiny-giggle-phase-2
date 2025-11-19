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
    const title = req.nextUrl.searchParams.get("title");

    const where: any = { parentId, childId };
    if (title) {
      where.title = {
        contains: title.trim(),
        mode: "insensitive",
      };
    }

    if (!parentId || !childId)
      return Res.badRequest({ message: "parentId, childId, and date are required" });

    const schedule = await prisma.feedSchedule.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    return Res.success({ message: "Feed schedule fetched", data: schedule });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
