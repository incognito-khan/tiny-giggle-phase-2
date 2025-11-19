import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId } = await params;
    if (!adminId) return Res.badRequest({ message: "Admin ID is required" });

    const body = await req.json();
    const { title, description, month, imageUrl } = body;

    if (!title || !month) {
      return Res.badRequest({ message: "title and month are required" });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        month,
        imageUrl,
        adminId: adminId,
      },
    });

    return Res.created({
      message: "Milestone created successfully",
      data: milestone,
    });
  } catch (error) {
    console.error("Milestone create error:", error);
    return Res.serverError();
  }
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {

    // Get all milestones of this child with sub-milestones
    const milestones = await prisma.milestone.findMany({
      include: {
        subMilestones: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true
          },
        },
      },
      orderBy: { month: "desc" },
    });

    return Res.success({
      message: "Milestones fetched successfully",
      data: milestones,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}