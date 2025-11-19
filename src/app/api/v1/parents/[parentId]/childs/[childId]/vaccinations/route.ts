import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string; parentId: string; }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { childId, parentId } = await params;

    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required!" })
    }

    if (!childId) {
      return Res.badRequest({ message: "Child ID is required!" })
    }

    // Fetch all vaccinations
    const vaccinations = await prisma.vaccination.findMany({
      orderBy: { month: "asc" },
      select: {
        id: true,
        name: true,
        administrationSite: true,
        month: true,
        country: true,
        createdAt: true
      }
    })

    // Fetch child's progress (only vaccinationId + status)
    const progresses = await prisma.vaccinationProgress.findMany({
      where: { childId },
      select: { vaccinationId: true, status: true },
    })

    // Convert to a lookup map for O(1) access
    const progressMap = new Map(
      progresses.map((p) => [p.vaccinationId, p.status])
    )

    // Merge progress status into vaccination list
    const result = vaccinations.map((v) => ({
      ...v,
      status: progressMap.get(v.id) || "PENDING",
    }))

    return Res.ok({ data: result, message: "Vaccinations fetched successfully" })
  } catch (error) {
    console.error(error)
    return Res.serverError({ message: "Failed to fetch child vaccinations" })
  }
}
