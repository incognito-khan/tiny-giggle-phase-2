import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function PATCH(
    req: NextRequest, 
    { params }: { params: Promise<{ vaccinationId: string, adminId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { vaccinationId, adminId } = await params

        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        if (!vaccinationId) {
            return Res.badRequest({ message: "Please Provide Vaccination ID" })
        }

        const data = await req.json()

        const vaccination = await prisma.vaccination.update({
            where: { id: vaccinationId },
            data,
            select: {
                id: true,
                name: true,
                administrationSite: true,
                month: true,
                country: true,
                createdAt: true
            }
        })

        return Res.ok({ message: "Vaccination updated successfully", data: vaccination })
    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to update vaccination" })
    }
}

export async function DELETE(
    req: NextRequest,
     { params }: { params: Promise<{ vaccinationId: string; adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { vaccinationId, adminId } = await params;

        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        if (!vaccinationId) {
            return Res.badRequest({ message: "Please Provide Vaccination ID" })
        }

        const vacIds = (await prisma.vaccinationProgress.findMany({
            where: { vaccinationId },
            select: { id: true },
        })).map(v => v.id)

        if (vacIds.length > 0) {
            await prisma.vaccinationProgress.deleteMany({
                where: { id: { in: vacIds } },
            });
        }

        await prisma.vaccination.delete({
            where: { id: vaccinationId },
        })

        return Res.ok({ message: "Vaccination deleted successfully", data: vaccinationId })
    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to delete vaccination" })
    }
}