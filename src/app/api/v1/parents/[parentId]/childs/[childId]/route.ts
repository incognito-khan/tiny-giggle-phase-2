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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
) {
  try {
    const { success, message } = await verifyAccessTokenFromRequest(req);
    if (!success) {
      return Res.unauthorized({ message });
    }
    const { parentId, childId } = await params;
    if (!parentId || !childId) {
      return Res.badRequest({ message: "Parent or Child ID is required" });
    }

    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
    if (!isValidObjectId(childId) || !isValidObjectId(parentId)) {
      return Res.badRequest({ message: "Invalid ID format" });
    }

    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!existingParent) {
      const existingRelative = await prisma.childRelation.findUnique({
        where: { id: parentId },
      });

      if (!existingRelative) {
        return Res.notFound({ message: "Invalid Parent or Relative ID provided" });
      }
    }

    const childExists = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!childExists) {
      return Res.notFound({ message: "Child not found" });
    }

    const childDetail = await prisma.child.findUnique({
      where: {
        id: childId,
        parents: {
          every: {
            id: parentId,
          },
        },
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

    if (!childDetail) {
      return Res.notFound({ message: "Invalid Child ID provided" });
    }

    // CALCULATE AGE

    const calculateAge = (
      birthday: Date
    ): { years: number; months: number; days: number } => {
      const now = new Date();
      const ageInMs = now.getTime() - birthday.getTime();
      const ageDate = new Date(ageInMs);
      return {
        years: ageDate.getUTCFullYear() - 1970,
        months: ageDate.getUTCMonth(),
        days: ageDate.getUTCDate() - 1,
      };
    };

    const lastGrowth = await prisma.growthSummary.findFirst({
      where: {
        childId,
      },
      select: {
        id: true,
        weight: true,
        height: true,
        date: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // CALCULATE BMI
    const calculateBMI = (weight: number, height: number): number => {
      const heightInMeters = height / 100; // if stored in cm
      return parseFloat(
        (weight / (heightInMeters * heightInMeters)).toFixed(2)
      );
    };

    const classifyBMI = (bmi: number): string => {
      if (bmi < 14) return "Underweight";
      if (bmi >= 14 && bmi <= 18) return "Healthy weight";
      if (bmi > 18 && bmi <= 20) return "Overweight";
      return "Obese";
    };

    const getDaysSinceLastGrowth = (lastDate: Date | null): number => {
      if (lastDate) {
        const now = new Date();
        const diffInMs = now.getTime() - lastDate.getTime();
        return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      }
      return 0;
    };

    const response = {
      ...childDetail,
      avatar: await signUrl(childDetail.avatar),
      currentAge: calculateAge(childDetail.birthday),
      bmi: calculateBMI(lastGrowth?.weight || 0, lastGrowth?.height || 0),
      bmiStatus: classifyBMI(
        calculateBMI(lastGrowth?.weight || 0, lastGrowth?.height || 0)
      ),
      lastGrowth,
      lastGrowthDate: getDaysSinceLastGrowth(lastGrowth?.date || null),
    };
    console.log(response, 'response')
    return Res.ok({
      message: "Child detail fetch successfully",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
) {
  try {
    const { success, message } = await verifyAccessTokenFromRequest(req);
    if (!success) {
      return Res.unauthorized({ message });
    }

    const { parentId, childId } = await params;
    if (!parentId || !childId) {
      return Res.badRequest({ message: "Parent or Child ID is required" });
    }

    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
    if (!isValidObjectId(childId) || !isValidObjectId(parentId)) {
      return Res.badRequest({ message: "Invalid ID format" });
    }

    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parents: { some: { id: parentId } },
        isDeleted: false,
      },
    });

    if (!child) {
      return Res.notFound({ message: "Child not found or already removed" });
    }

    await prisma.child.update({
      where: { id: childId },
      data: { isDeleted: true },
    });

    return Res.ok({ message: "Child removed successfully", data: { childId } });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}
