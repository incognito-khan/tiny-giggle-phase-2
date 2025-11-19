import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string; parentId: string; vaccinationId: string; }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { childId, parentId, vaccinationId } = await params;

    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required!" })
    }

    if (!childId) {
      return Res.badRequest({ message: "Child ID is required!" })
    }

    if (!vaccinationId) {
      return Res.badRequest({ message: "Vaccination ID is required!" })
    }

    const { status, date, time, note, image } = await req.json()

    const progress = await prisma.vaccinationProgress.upsert({
      where: {
        vaccinationId_childId: {
          vaccinationId,
          childId,
        },
      },
      update: {
        status,
        date: date ? new Date(date) : undefined,
        time,
        note,
        image,
      },
      create: {
        vaccinationId,
        childId,
        status: status || "PENDING",
        date: date ? new Date(date) : undefined,
        time,
        note,
        image,
      },
    })

    return Res.success({ message: "Vaccination progress updated successfully", data: { ...progress, vaccinationId } })
  } catch (error) {
    console.error(error)
    return Res.serverError({ message: "Failed to update vaccination progress" })
  }
}