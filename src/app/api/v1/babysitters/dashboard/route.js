import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { startOfWeek, endOfWeek, subWeeks, startOfDay, endOfDay } from "date-fns";

/**
 * GET /api/v1/babysitters/dashboard
 * Returns everything the babysitter dashboard needs in one authenticated call:
 *   - profile (name, photo, email)
 *   - stats   (active, pending, completed counts + total earnings)
 *   - bookings (5 most recent ACCEPTED/PENDING, with parent & child info)
 *   - earnings (per-day totals for the current week, derived from COMPLETED bookings)
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "babysitter") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const babysitterId = payload.id;

    // Run all queries in parallel — one round-trip to the DB
    const [babysitter, allAppointments] = await Promise.all([
      prisma.babysitter.findUnique({
        where: { id: babysitterId },
        select: {
          id: true,
          name: true,
          email: true,
          profilePictureUrl: true,
          city: true,
          hourlyRate: true,
          isVerified: true,
          isPaid: true,
          paidUntil: true,
        },
      }),
      prisma.appointment.findMany({
        where: { babysitterId },
        include: {
          parent: { select: { id: true, name: true, profilePicture: true } },
          child: { select: { id: true, name: true, type: true } },
        },
        orderBy: { appointmentDate: "desc" },
      }),
    ]);

    if (!babysitter) {
      return NextResponse.json(
        { success: false, message: "Babysitter not found" },
        { status: 404 }
      );
    }

    // ── Stats ────────────────────────────────────────────────────────────────
    const activeCount    = allAppointments.filter(a => a.status === "ACCEPTED").length;
    const pendingCount   = allAppointments.filter(a => a.status === "PENDING").length;
    const completedCount = allAppointments.filter(a => a.status === "COMPLETED").length;

    const completedAppointments = allAppointments.filter(a => a.status === "COMPLETED");

    const tinyGiggleEarnings = completedAppointments
      .filter(a => a.paymentMethod === "TINY_GIGGLE")
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    const selfEarnings = completedAppointments
      .filter(a => a.paymentMethod !== "TINY_GIGGLE")
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    const totalEarnings = tinyGiggleEarnings + selfEarnings;

    // ── Recent bookings (latest 5 ACCEPTED or PENDING) ───────────────────────
    const recentBookings = allAppointments
      .filter(a => a.status === "ACCEPTED" || a.status === "PENDING")
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        status: a.status,
        appointmentDate: a.appointmentDate,
        notes: a.notes,
        consultationFee: a.consultationFee,
        paymentMethod: a.paymentMethod,
        parent: a.parent,
        child: a.child,
      }));

    // ── Weekly earnings chart (current week, Mon→Sun) ────────────────────────
    const now       = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd   = endOfWeek(now, { weekStartsOn: 1 });

    const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Seed all 7 days with 0
    const earningsByDay = Object.fromEntries(DAY_NAMES.map(d => [d, 0]));

    allAppointments
      .filter(a =>
        a.status === "COMPLETED" &&
        a.appointmentDate >= weekStart &&
        a.appointmentDate <= weekEnd
      )
      .forEach(a => {
        const dayIndex = (new Date(a.appointmentDate).getDay() + 6) % 7; // 0=Mon…6=Sun
        earningsByDay[DAY_NAMES[dayIndex]] += a.consultationFee || 0;
      });

    const weeklyEarnings = DAY_NAMES.map(day => ({
      day,
      amount: earningsByDay[day],
    }));

    const weeklyTotal = Object.values(earningsByDay).reduce((s, v) => s + v, 0);

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        profile: babysitter,
        stats: {
          activeBookings:       activeCount,
          pendingRequests:      pendingCount,
          completedSessions:    completedCount,
          totalEarnings,
          tinyGiggleEarnings,
          selfEarnings,
        },
        recentBookings,
        earnings: {
          weekly: weeklyEarnings,
          weeklyTotal,
        },
      },
    });
  } catch (error) {
    console.error("Babysitter dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
