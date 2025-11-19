import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, childId } = await params;
    if (!parentId || !childId) {
      return Res.badRequest({ message: "Parent & Child ID is required" });
    }
    const growthSummary = await prisma.growthSummary.findFirst({
      where: {
        childId,
      },
      select: {
        id: true,
        weight: true,
        height: true,
        date: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return Res.success({
      message: "Growth summary",
      data: growthSummary || {},
    });
  } catch (error) {
    return Res.serverError();
  }
}
