import { prepareUser } from "@/lib/prepare-user";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  format 
} from "date-fns";

/**
 * GET /api/v1/doctors/dashboard
 * Centralized endpoint for all doctor dashboard data.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "doctor") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const doctorId = payload.id;

    // Fetch doctor profile
    const doctorData = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        bio: true,
        consultationFee: true,
        paymentCollectionMethod: true,
        withdrawalFrequency: true,
        profilePicture: true,
        isPaid: true,
        paidUntil: true,
      }
    });

    if (!doctorData) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
    }

    const doctor = await prepareUser(doctorData, "doctor");

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Fetch all relevant appointments in one go (or split for clarity)
    const [appointmentsToday, pendingAppointments, allDoctorAppointments] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: { gte: todayStart, lte: todayEnd },
          status: { not: "CANCELLED" }
        }
      }),
      prisma.appointment.count({
        where: { doctorId, status: "PENDING" }
      }),
      prisma.appointment.findMany({
        where: { doctorId },
        select: { parentId: true, childId: true, consultationFee: true, status: true, appointmentDate: true }
      })
    ]);

    // Calculate Stats
    // Counting total visits/appointments as "Patients" per user request for volume visibility
    const totalPatients = allDoctorAppointments.filter(a => a.status !== "CANCELLED").length;

    const todayEarnings = appointmentsToday
      .filter(a => a.status === "COMPLETED")
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    const totalEarnings = allDoctorAppointments
      .filter(a => a.status === "COMPLETED")
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    // Recent Appointments (Upcoming, today or future)
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: todayStart },
        status: { in: ["PENDING", "ACCEPTED"] }
      },
      include: {
        parent: { select: { id: true, name: true, profilePicture: true } },
        child: { select: { id: true, name: true, type: true } }
      },
      orderBy: { appointmentDate: "asc" },
      take: 5
    });

    // Chart Data: Appointments per day this week
    const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const flowByDay = Object.fromEntries(DAY_NAMES.map(d => [d, 0]));

    allDoctorAppointments
      .filter(a => a.appointmentDate >= weekStart && a.appointmentDate <= weekEnd)
      .forEach(a => {
        const dayIndex = (new Date(a.appointmentDate).getDay() + 6) % 7; // 0=Mon, 6=Sun
        flowByDay[DAY_NAMES[dayIndex]] += 1;
      });

    const chartData = DAY_NAMES.map(day => ({
      day,
      patients: flowByDay[day],
    }));

    return NextResponse.json({
      success: true,
      data: {
        profile: doctor,
        stats: {
          activeToday: appointmentsToday.length,
          pendingRequests: pendingAppointments,
          totalPatients,
          todayEarnings,
          totalEarnings,
        },
        recentAppointments,
        chartData
      }
    });

  } catch (error) {
    console.error("Doctor dashboard error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
