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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { milestoneId } = await params;

    const milestones = await prisma.milestone.findUnique({
      where: { id: milestoneId },
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

    if (!milestones) {
      return Res.notFound({ message: "Milestone not found" });
    }

    const milestoneWithSignedUrl = {
      ...milestones,
      imageUrl: await signUrl(milestones.imageUrl),
      subMilestones: await Promise.all(
        milestones.subMilestones.map(async (subMilestone) => ({
          ...subMilestone,
          imageUrl: await signUrl(subMilestone.imageUrl),
        })),
      ),
    };

    return Res.success({
      message: "Milestone fetched successfully",
      data: milestoneWithSignedUrl,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
