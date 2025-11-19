import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, childId } = await params;
        const body = await req.json();
        const { temperature, date } = body;

        if (!temperature)
            return Res.badRequest({ message: "Temperature is required" });

        // Create Activity
        const activity = await prisma.activity.create({
            data: {
                type: "TEMPERATURE",
                parentId,
                childId,
                temperature: {
                    create: {
                        temperature,
                        date: new Date(date) || new Date()
                    }
                }
            },
            select: {
                temperature: {
                    select: {
                        temperature: true,
                        date: true
                    }
                }
            }
        });

        return Res.created({ message: "Temperature is added", data: activity });
    } catch (error) {
        console.error(error);
        return Res.serverError();
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; childId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, childId } = await params;

        const dateParam = req.nextUrl.searchParams.get("date");

        const where: any = { parentId, childId, type: "TEMPERATURE" };
        if (dateParam) {
            const startDate = new Date(`${dateParam}T00:00:00.000Z`);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            // Filter by temperature.date instead of createdAt
            where.temperature = {
                some: {
                    date: { gte: startDate, lt: endDate },
                },
            };
        }


        // Create Activity
        const temperature = await prisma.activity.findMany({
            where,
            select: {
                temperature: {
                    orderBy: { date: "desc" },
                    select: {
                        temperature: true,
                        date: true
                    }
                }
            }
        });

        return Res.created({ message: "Temperature fetched successfully", data: temperature });
    } catch (error) {
        console.error(error);
        return Res.serverError();
    }
}
