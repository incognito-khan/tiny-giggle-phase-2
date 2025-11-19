import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ parentId: string; issueId: string; commentId: string }>;
  }
) {
  const { parentId, issueId, commentId } = await params;
  const { content } = await req.json();
  if (!content || !parentId || !issueId || !commentId) {
    return Res.unauthorized({ message: "All fields are required" });
  }
  try {
    const reply = await prisma.comment.create({
      data: {
        content,
        parent: { connect: { id: parentId } },
        issue: { connect: { id: issueId } },
        parentComment: { connect: { id: commentId } },
      },
    });
    return Res.created({ message: "Reply has been created" });
  } catch (error) {
    console.log(error);
    return Res.serverError();
  }
}
