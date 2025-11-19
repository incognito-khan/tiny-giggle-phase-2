import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId, childId } = await params;
    if (!parentId || !childId) {
      return Res.badRequest({ message: "Parent & Child ID is required" });
    }
    const growthSummary = await prisma.growthSummary.findMany({
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
        date: "desc",
      },
    });

    const childDetail = await prisma.child.findUnique({
      where: {
        id: childId
      },
      select: {
        birthday: true
      }
    })

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

    const growthWithAge = growthSummary.map((g) => ({
      ...g,
      age: calculateAge(new Date(childDetail.birthday)),
    }));

    return Res.success({
      message: "Growth summary",
      data: growthWithAge,
    });
  } catch (error) {
    return Res.serverError();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { parentId, childId } = await params;
  const { weight, height, date } = await req.json();
  if (!parentId || !childId) {
    return Res.badRequest({ message: "Parent & Child ID is required" });
  }
  if (!weight || !height || !date) {
    return Res.badRequest({ message: "Weight, Height & Date are required" });
  }
  try {
    const growthSummary = await prisma.growthSummary.create({
      data: {
        childId,
        weight,
        height,
        date: new Date(date),
      },
      select: {
        id: true,
        weight: true,
        height: true,
        date: true,
      },
    });

    const childDetail = await prisma.child.findUnique({
      where: { id: childId },
      select: { birthday: true, type: true },
    });

    if (!childDetail) {
      return Res.badRequest({ message: "Child not found" });
    }

    // Calculate age
    const calculateAge = (birthday: Date) => {
      const now = new Date();
      const ageInMs = now.getTime() - birthday.getTime();
      const ageDate = new Date(ageInMs);
      return {
        years: ageDate.getUTCFullYear() - 1970,
        months: ageDate.getUTCMonth(),
        days: ageDate.getUTCDate() - 1,
      };
    };

    // Return same pattern as GET
    const growthWithAge = {
      ...growthSummary,
      age: calculateAge(new Date(childDetail.birthday)),
      type: childDetail.type
    };

    return Res.success({
      message: "Growth summary added successfully",
      data: growthWithAge,
    });
  } catch (error) {
    return Res.serverError();
  }
}
