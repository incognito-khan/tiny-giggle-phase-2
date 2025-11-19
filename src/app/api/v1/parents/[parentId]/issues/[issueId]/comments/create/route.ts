import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";
import { Res } from "@/lib/general-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; issueId: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { content } = await req.json();
  const { parentId, issueId } = await params;
  if (!content || !parentId || !issueId) {
    return Res.unauthorized({ message: "You are unauthorized" });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        parent: { connect: { id: parentId } },
        issue: { connect: { id: issueId } },
      },
    });
    return Res.created({ message: "Comment has been created", data: comment });
  } catch (error) {
    return Res.serverError();
  }
}
