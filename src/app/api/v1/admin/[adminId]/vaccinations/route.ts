import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
    req: NextRequest, 
    { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        const { name, administrationSite, month, country } = await req.json()

        if (!name || !administrationSite || !month || !country)
            return Res.badRequest({ message: "All required fields must be provided." })

        const vaccination = await prisma.vaccination.create({
            data: {
                name,
                administrationSite,
                month,
                country
            },
        })

        return Res.created({ message: "Vaccination created successfully", data: vaccination })
    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to create vaccination" })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        const vaccinations = await prisma.vaccination.findMany({
            orderBy: { month: "desc" },
            select: {
                id: true,
                name: true,
                administrationSite: true,
                month: true,
                country: true,
                createdAt: true
            }
        })

        return Res.success({ message: "Vaccinations fetched successfully", data: vaccinations })
    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to fetch vaccinations" })
    }
}