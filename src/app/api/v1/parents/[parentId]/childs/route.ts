import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { NextRequest } from "next/server";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string) {
  const key = url.includes("amazonaws.com")
    ? url.split(".amazonaws.com/")[1]
    : url;
  return getPresignedUrl(key);
}

const calculateAge = (birthday: Date): { years: number; months: number; days: number } => {
  const now = new Date();
  const ageInMs = now.getTime() - birthday.getTime();
  const ageDate = new Date(ageInMs);
  return {
    years: ageDate.getUTCFullYear() - 1970,
    months: ageDate.getUTCMonth(),
    days: ageDate.getUTCDate() - 1,
  };
};

const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

const classifyBMI = (bmi: number): string => {
  if (bmi < 14) return "Underweight";
  if (bmi >= 14 && bmi <= 18) return "Healthy weight";
  if (bmi > 18 && bmi <= 20) return "Overweight";
  return "Obese";
};

const getDaysSinceLastGrowth = (lastDate: Date | null): number => {
  if (!lastDate) return 0;
  const now = new Date();
  const diffInMs = now.getTime() - lastDate.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    const { success, message } = await verifyAccessTokenFromRequest(req);
    if (!success) {
      return Res.unauthorized({ message });
    }

    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required" });
    }

    const childs = await prisma.child.findMany({
      where: {
        parents: {
          some: {
            id: parentId,
          },
        },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        birthday: true,
        height: true,
        weight: true,
        type: true,
      },
    });

    if (!childs.length) {
      return Res.notFound({ message: "No child found" });
    }

    const enrichedChilds = await Promise.all(
      childs.map(async (child) => {
        const lastGrowth = await prisma.growthSummary.findFirst({
          where: { childId: child.id },
          select: {
            id: true,
            weight: true,
            height: true,
            date: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const bmi = calculateBMI(lastGrowth?.weight || 0, lastGrowth?.height || 0);

        return {
          ...child,
          avatar: await signUrl(child.avatar),
          currentAge: calculateAge(child.birthday),
          bmi,
          bmiStatus: classifyBMI(bmi),
          lastGrowthDate: getDaysSinceLastGrowth(lastGrowth?.date || null),
        };
      })
    );

    return Res.ok({ message: "Data fetch successfully", data: enrichedChilds });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}