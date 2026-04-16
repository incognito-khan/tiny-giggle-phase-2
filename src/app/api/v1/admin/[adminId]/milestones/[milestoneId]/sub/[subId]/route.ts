import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string) {
  const key = url.includes("amazonaws.com")
    ? url.split(".amazonaws.com/")[1]
    : url;

  return getPresignedUrl(key);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; subId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, subId } = await params;
    if (!adminId) return Res.badRequest({ message: "Admin ID is required" });
    if (!subId)
      return Res.badRequest({ message: "Sub Milestone ID is required" });

    const data = await req.json();

    const updatedSubMilestone = await prisma.subMilestone.update({
      where: { id: subId },
      data,
    });

    const signedUrl = await signUrl(updatedSubMilestone.imageUrl);

    return Res.success({
      message: "Sub Milestone updated successfully",
      data: { ...updatedSubMilestone, imageUrl: signedUrl },
    });
  } catch (error) {
    console.error("Update Sub Milestone error:", error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; subId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, subId } = await params;
    if (!subId)
      return Res.badRequest({ message: "Sub Milestone ID is required" });
    if (!adminId) return Res.badRequest({ message: "Admin ID is required" });

    await prisma.subMilestone.delete({
      where: { id: subId },
    });

    return Res.ok({ message: "Deleted Successfully", data: subId });
  } catch (error) {
    console.error("Delete Sub-milestone error:", error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}
