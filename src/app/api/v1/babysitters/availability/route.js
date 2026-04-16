import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * GET /api/v1/babysitters/availability
 * Returns the current availability settings for the logged-in babysitter.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "babysitter") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const babysitterId = payload.id;

    const availability = await prisma.availability.findMany({
      where: { babysitterId },
    });

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("GET Babysitter Availability Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/babysitters/availability
 * Updates/Upserts availability settings for the logged-in babysitter.
 * Body: { availability: [{ day: "Mon", startTime: "09:00", endTime: "17:00", active: true }, ...] }
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "babysitter") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const babysitterId = payload.id;
    const { availability } = await request.json();

    if (!Array.isArray(availability)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    // We'll perform a simple sync: delete existing and create new
    // This is often easier for a "week-at-a-glance" management UI
    await prisma.$transaction([
      prisma.availability.deleteMany({
        where: { babysitterId },
      }),
      prisma.availability.createMany({
        data: availability
          .filter(a => a.active) // Only save active days
          .map(a => ({
            babysitterId,
            day: a.day,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("POST Babysitter Availability Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
