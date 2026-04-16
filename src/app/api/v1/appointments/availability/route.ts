import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { format, startOfDay, endOfDay, addHours, parse, isAfter, isBefore } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAccessTokenFromRequest(req);
    if (!authResult.success) {
      return Res.unauthorized({ message: authResult.message });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "doctor";
    const dateStr = searchParams.get("date");

    if (!id || !dateStr) {
      return Res.badRequest({ message: "Missing id or date" });
    }

    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    const dayName = format(date, "EEE"); // "Mon", "Tue"...

    // 1. Fetch Working Hours
    const availability = await prisma.availability.findFirst({
      where: {
        ...(type === "doctor" ? { doctorId: id } : { babysitterId: id }),
        day: dayName
      }
    });

    if (!availability) {
      return Res.ok({ data: [], message: `No working hours defined for ${dayName}` });
    }

    // 2. Fetch Existing Appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        ...(type === "doctor" ? { doctorId: id } : { babysitterId: id }),
        appointmentDate: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        },
        status: { not: "CANCELLED" }
      },
      select: { appointmentDate: true }
    });

    // 3. Generate Slots
    const slots = [];
    
    // Normalize time format to HH:mm (e.g. "9:00" -> "09:00")
    const normalizeTime = (t: string) => {
      if (!t) return null;
      const parts = t.split(':');
      if (parts.length !== 2) return null;
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    };

    const startTime = normalizeTime(availability.startTime);
    const endTime = normalizeTime(availability.endTime);

    if (!startTime || !endTime) {
       return Res.ok({ data: [], message: "Invalid working hours format in database" });
    }

    const start = parse(startTime, "HH:mm", date);
    const end = parse(endTime, "HH:mm", date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return Res.ok({ data: [], message: "Could not parse working hours" });
    }

    if (!isBefore(start, end)) {
       return Res.ok({ data: [], message: `Working hours range is invalid for ${dayName} (${startTime} to ${endTime})` });
    }
    
    let currentSlot = start;
    const now = new Date();

    while (isBefore(currentSlot, end)) {
      const slotTimeStr = format(currentSlot, "HH:mm");
      const isBooked = appointments.some(app => 
        format(new Date(app.appointmentDate), "HH:mm") === slotTimeStr
      );
      
      const isPast = isBefore(currentSlot, now);

      slots.push({
        time: slotTimeStr,
        available: !isBooked && !isPast
      });

      currentSlot = addHours(currentSlot, 1);
    }

    return Res.ok({ 
      data: slots, 
      message: "Availability fetched successfully" 
    });

  } catch (error) {
    console.error("Fetch availability error:", error);
    return Res.serverError();
  }
}
