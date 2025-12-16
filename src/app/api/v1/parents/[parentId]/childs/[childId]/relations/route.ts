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
    const relations = await prisma.childRelation.findMany({
      where: {
        childId: {
          has: childId,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        dateOfDeath: true,
        relation: true,
        createdAt: true,
        email: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });
    return Res.success({
      message: "Relations fetch successfully",
      data: relations,
    });
  } catch (error) {
    return Res.serverError();
  }
}
