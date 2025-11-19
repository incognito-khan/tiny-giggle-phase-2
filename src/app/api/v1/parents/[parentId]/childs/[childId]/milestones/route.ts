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
    if (!parentId) return Res.badRequest({ message: "Parent ID is required" });
    if (!childId) return Res.badRequest({ message: "Child ID is required" });

    // Get all milestones (even if no progress exists)
    const milestones = await prisma.milestone.findMany({
      include: {
        subMilestones: {
          include: {
            progressRecords: {
              where: { childId }, // fetch progress if exists
            },
          },
        },
      },
      orderBy: { month: "asc" },
    });

    // Format for frontend
    const result = milestones.map((m) => ({
      id: m.id,
      month: m.month,
      title: m.title,
      description: m.description,
      imageUrl: m.imageUrl,
      subMilestones: m.subMilestones.map((s) => {
        const progress = s.progressRecords[0];
        return {
          id: s.id,
          title: s.title,
          description: s.description,
          imageUrl: s.imageUrl,
          isCompleted: progress?.achieved || false,
          achievedAt: progress?.achievedAt || null,
          note: progress?.note || null,
        };
      }),
    }));

    return Res.success({
      message: "Milestones fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
