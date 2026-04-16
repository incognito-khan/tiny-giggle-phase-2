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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId } = await params;
    if (!adminId) return Res.badRequest({ message: "Admin ID is required" });

    const body = await req.json();
    const { title, description, month, imageUrl } = body;

    if (!title || !month) {
      return Res.badRequest({ message: "title and month are required" });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        month,
        imageUrl,
        adminId: adminId,
      },
    });

    const signedUrl = await signUrl(milestone.imageUrl);

    return Res.created({
      message: "Milestone created successfully",
      data: { ...milestone, imageUrl: signedUrl },
    });
  } catch (error) {
    console.error("Milestone create error:", error);
    return Res.serverError();
  }
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get all milestones of this child with sub-milestones
    const milestones = await prisma.milestone.findMany({
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
      orderBy: { month: "desc" },
    });

    const milestonesWithSignedUrls = await Promise.all(
      milestones.map(async (milestone) => ({
        ...milestone,
        imageUrl: await signUrl(milestone.imageUrl),
        subMilestones: await Promise.all(
          milestone.subMilestones.map(async (subMilestone) => ({
            ...subMilestone,
            imageUrl: await signUrl(subMilestone.imageUrl),
          })),
        ),
      })),
    );

    return Res.success({
      message: "Milestones fetched successfully",
      data: milestonesWithSignedUrls,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
