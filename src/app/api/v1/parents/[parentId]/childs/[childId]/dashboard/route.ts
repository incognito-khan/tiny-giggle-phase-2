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

        const child = await prisma.child.findUnique({
            where: { id: childId },
            select: {
                birthday: true
            }
        });

        const birthday = child?.birthday ? new Date(child.birthday) : null;

        let ageInMonths = 0;
        if (birthday) {
            const today = new Date();

            ageInMonths =
                today.getFullYear() * 12 +
                today.getMonth() -
                (birthday.getFullYear() * 12 + birthday.getMonth());
        }

        const growthSummary = await prisma.growthSummary.findFirst({
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

        const latestTemperatureData = await prisma.activity.findFirst({
            where: { parentId, childId, type: "TEMPERATURE" },
            orderBy: { createdAt: "desc" },
            select: {
                temperature: {
                    select: {
                        temperature: true,
                        date: true
                    }
                }
            }
        });
        const latestTemperature = latestTemperatureData?.temperature?.[0] || null;

        const latestSleep = await prisma.babySleep.findFirst({
            where: { parentId, childId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                sleepTime: true,
                awakeTime: true,
                duration: true,
                sleepType: true,
                createdAt: true,
            }
        });


        const sleepLast7Days = await prisma.babySleep.findMany({
            where: {
                parentId,
                childId,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            select: {
                duration: true,
            },
        });

        // Sum the durations
        const totalSleepMinutesLast7Days = sleepLast7Days.reduce(
            (sum, s) => sum + (s.duration || 0),
            0
        );

        const currentFeed = await prisma.feedSchedule.findFirst({
            where: { parentId, childId, inUsed: true },
            include: {
                feedSlots: true
            }
        });

        // const feedPerDay = currentFeed.feedSlots.length;
        const feedSlots = currentFeed?.feedSlots ?? [];
        const feedPerDay = feedSlots.length;

        // const nextVaccination = await prisma.vaccinationProgress.findFirst({
        //     where: {
        //         childId,
        //         status: "PENDING",
        //     },
        //     orderBy: {
        //         vaccination: {
        //             month: "asc",
        //         }
        //     },
        //     select: {
        //         status: true,
        //         date: true,
        //         vaccination: {
        //             select: {
        //                 name: true,
        //                 month: true,
        //                 country: true
        //             }
        //         }
        //     }
        // });

        const allSubMilestones = await prisma.subMilestone.findMany({
            select: {
                id: true,
                title: true,
                milestone: { select: { title: true, month: true } },
            },
        });

        // 2️⃣ Fetch achieved milestone progresses
        const achievedMilestoneIds = await prisma.childMilestoneProgress.findMany({
            where: { childId, achieved: true },
            select: { subMilestoneId: true },
        });

        // 3️⃣ Determine next milestone
        const nextMilestone = allSubMilestones
            .filter(s => !achievedMilestoneIds.some(a => a.subMilestoneId === s.id))
            .sort((a, b) => (a.milestone.month || 0) - (b.milestone.month || 0))[0] || null;

        // 4️⃣ Last achieved milestone
        const lastMilestone = await prisma.childMilestoneProgress.findFirst({
            where: { childId, achieved: true },
            orderBy: { achievedAt: "desc" },
            select: {
                achievedAt: true,
                subMilestone: { select: { title: true, milestone: { select: { month: true } } } },
            },
        });

        // 5️⃣ Count achieved and remaining milestones
        const totalMilestones = allSubMilestones.length;
        const achievedMilestones = achievedMilestoneIds.length;
        const remainingMilestones = totalMilestones - achievedMilestones;

        // 6️⃣ VACCINATIONS
        const allVaccinations = await prisma.vaccination.findMany({
            select: { id: true, name: true, month: true, country: true },
        });

        // Fetch vaccination progress
        const vaccinationProgress = await prisma.vaccinationProgress.findMany({
            where: { childId },
            select: {
                vaccinationId: true, status: true, date: true, vaccination: {
                    select: { name: true }
                }
            },
        });

        // Achieved vaccination IDs
        const achievedVaccinationIds = vaccinationProgress
            .filter(v => v.status === "TAKEN")
            .map(v => v.vaccinationId);

        const monthOrder = {
            AT_BIRTH: 0,
            MONTH_2: 2,
            MONTH_4: 4,
            MONTH_6: 6,
            MONTH_12: 12,
            MONTH_18: 18,
            YEAR_5: 60,
        };

        // Next vaccination
        const nextVaccination = allVaccinations
            .filter(v => !achievedVaccinationIds.includes(v.id))
            .sort((a, b) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0))[0] || null;

        // Last vaccination
        const lastVaccination = vaccinationProgress
            .filter(v => v.status === "TAKEN")
            .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))[0] || null;

        // Count vaccinations
        const totalVaccinations = allVaccinations.length;
        const achievedVaccinations = achievedVaccinationIds.length;
        const remainingVaccinations = totalVaccinations - achievedVaccinations;






        return Res.success({
            message: "Growth summary",
            data: {
                growthSummary,
                latestTemperature,
                latestSleep,
                totalSleepMinutesLast7Days,
                currentFeed: currentFeed.title || null,
                feedPerDay,
                milestones: { nextMilestone, lastMilestone, totalMilestones, achievedMilestones, remainingMilestones },
                vaccinations: { nextVaccination, lastVaccination, totalVaccinations, achievedVaccinations, remainingVaccinations },
            },
        });
    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Internal Server Error" });
    }
}
