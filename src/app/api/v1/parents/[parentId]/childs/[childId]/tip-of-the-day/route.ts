import { tipsByAge } from "@/data/tip-of-the-day";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function calculateAgeInDays(dob: Date): number {
  const now = new Date();
  const diff = now.getTime() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTipForToday(ageInDays: number): string {
  const maxDay = Math.max(...Object.keys(tipsByAge).map(Number));

  // Pick a valid tip day
  const tipDay =
    ageInDays <= maxDay ? ageInDays : Math.floor(ageInDays % (maxDay + 1)); // cycle back to 0–70

  const tips = tipsByAge[tipDay] || ["Enjoy your time with your baby today!"];

  // Use current date to consistently pick the same tip each day
  const dayOfYear = Math.floor(
    (new Date().getTime() -
      new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  const index = dayOfYear % tips.length;

  return tips[index];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, childId } = await params;
    if (!parentId || !childId) {
      return Res.badRequest({ message: "Parent & Child ID is required" });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { birthday: true },
    });

    if (!child?.birthday) {
      return Res.badRequest({ message: "Child's date of birth not found" });
    }

    const ageInDays = calculateAgeInDays(new Date(child.birthday));
    const tip = getTipForToday(ageInDays);
    return Res.success({
      message: "Tip of the day",
      data: tip,
    });
  } catch (error) {
    return Res.serverError();
  }
}
