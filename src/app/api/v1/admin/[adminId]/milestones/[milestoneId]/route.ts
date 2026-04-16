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
  { params }: { params: Promise<{ adminId: string; milestoneId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, milestoneId } = await params;
    if (!adminId) return Res.badRequest({ message: "Admin ID is required" });
    if (!milestoneId)
      return Res.badRequest({ message: "Milestone ID is required" });

    const data = await req.json();

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data,
      include: {
        subMilestones: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
          },
        },
      },
    });

    const signedUrl = await signUrl(updatedMilestone.imageUrl);

    return Res.success({
      message: "Milestone updated successfully",
      data: { ...updatedMilestone, imageUrl: signedUrl },
    });
  } catch (error) {
    console.error("Update Milestone error:", error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; milestoneId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { milestoneId, adminId } = await params;
    if (!milestoneId)
      return Res.badRequest({ message: "Milestone ID is required" });
    if (!adminId) return Res.badRequest({ message: "Admin ID is required" });

    await prisma.subMilestone.deleteMany({
      where: { milestoneId },
    });

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return Res.ok({ message: "Deleted Successfully", data: milestoneId });
  } catch (error) {
    console.error("Delete Milestone error:", error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}
