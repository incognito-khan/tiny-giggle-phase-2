import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { question } = await req.json();
  const { parentId } = await params;
  if (!parentId || !question) {
    return Res.badRequest({ message: "Invalid data provided" });
  }
  try {
    const issue = await prisma.issue.create({
      data: {
        question,
        parent: {
          connect: { id: parentId },
        },
      },
    });
    return Res.created({
      message: "Your concern has been created",
      data: issue,
    });
  } catch (error) {
    return Res.serverError();
  }
}
