import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; issueId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, issueId } = await params;
    if (!parentId || !issueId) {
      return Res.unauthorized({ message: "All fields are required" });
    }
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        question: true,
        comments: {
          select: {
            id: true,
            content: true,
            replies: {
              select: {
                id: true,
                content: true,
              },
            },
          },
        },
      },
    });
    return Res.success({ message: "Data fetch successfully", data: issue });
  } catch (error) {
    return Res.serverError();
  }
}
