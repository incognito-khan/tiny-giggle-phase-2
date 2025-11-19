import { sendEmail } from "@/actions/send-email";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { toEmail } = await req.json();
    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent id is required" });
    }
    if (!toEmail) {
      return Res.badRequest({ message: "Email is required" });
    }
    const existingParent = await prisma.parent.findUnique({
      where: {
        id: parentId,
      },
      select: {
        name: true,
        childIds: true,
      },
    });
    if (!existingParent) {
      return Res.notFound({ message: "No parent found" });
    }
    const firstChildId = existingParent?.childIds?.[0];
    if (!firstChildId) {
      return Res.notFound({
        message: "No child found, please create child first",
      });
    }
    const allParentsForChild = await prisma.child.findUnique({
      where: { id: firstChildId },
      select: {
        parentIds: true,
      },
    });
    if (!allParentsForChild) {
      return Res.notFound({ message: "No Record found" });
    }

    if (allParentsForChild?.parentIds?.length >= 2) {
      return Res.badRequest({ message: "Both parents are already created" });
    }

    const inviteLink = "https://invite.com";
    const res = await sendEmail(toEmail, "invite-parent", {
      inviterName: existingParent.name,
      inviteLink,
    });

    if (!res.success) {
      return Res.error({ message: "Error in sending Invite link" });
    }
    return Res.success({ message: "Email has been sent" });
  } catch (error) {
    console.log(error);
    return Res.serverError();
  }
}
