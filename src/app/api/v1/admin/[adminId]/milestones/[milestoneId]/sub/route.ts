import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { milestoneId } = await params;
    if (!milestoneId) return Res.badRequest({ message: "Milestone ID is required" });

    const body = await req.json();
    const { title, description, imageUrl } = body;

    if (!title) return Res.badRequest({ message: "Sub-milestone title is required" });

    const subMilestone = await prisma.subMilestone.create({
      data: {
        title,
        description,
        imageUrl,
        milestoneId,
      },
    });

    return Res.created({
      message: "Sub-milestone added successfully",
      data: subMilestone,
    });
  } catch (error) {
    console.error("Sub-milestone create error:", error);
    return Res.serverError();
  }
}