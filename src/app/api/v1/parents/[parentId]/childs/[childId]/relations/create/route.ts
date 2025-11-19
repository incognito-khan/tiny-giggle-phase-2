import { Res } from "@/lib/general-response";
import { sendEmail } from "@/actions/send-email";
import { hashing } from "@/lib/helpers/hash";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, childId } = await params;
    const { name, dateOfBirth, dateOfDeath, relation, email } = await req.json();
    if (!parentId || !childId) {
      return Res.badRequest({ message: "Parent & Child ID is required" });
    }
    if (!name || !dateOfBirth) {
      return Res.badRequest({ message: "All fields are required" });
    }
    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });
    if (!existingParent) {
      return Res.badRequest({ message: "No Parent found" });
    }
    const existingChild = await prisma.child.findUnique({
      where: { id: childId },
    });
    if (!existingChild) {
      return Res.badRequest({ message: "No child found" });
    }
    const password = nanoid(8);

    const hashedPassword = await hashing(password);
    const result = await prisma.childRelation.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dateOfBirth,
        dateOfDeath,
        relation,
        childId: existingChild.id,
        isDeleted: false
      },
    });
    
    const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth?tab=login`;
    const res = await sendEmail(email, "new-relative-account", {
      inviterName: existingParent.name,
      email,
      password,
      loginLink,
      relativeName: name,
      relation
    })

    return Res.created({ message: "Relation added successfully", data: result });
  } catch (error) {
    console.log(error);
    return Res.serverError();
  }
}
