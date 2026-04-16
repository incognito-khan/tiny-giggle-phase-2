import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * GET /api/v1/patients
 * Fetch all patients for a specific doctor
 */
export async function GET(request) {
  try {
    // Extract doctor ID from JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const doctorId = payload.id;

    // Get real patients: children of parents who have appointments with this doctor
    // Include multiple appointment statuses to ensure we get patients
    let appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        status: {
          in: ["ACCEPTED", "PENDING", "COMPLETED"] // Include multiple statuses
        }
      },
      include: {
        parent: {
          include: {
            children: true
          }
        }
      }
    });

    console.log(`Found ${appointments.length} appointments for doctor ${doctorId}`);

    // If no appointments found, let's try without status filter to see all appointments
    if (!appointments || appointments.length === 0) {
      const allAppointments = await prisma.appointment.findMany({
        where: { doctorId: doctorId },
        include: {
          parent: {
            include: {
              children: true
            }
          }
        }
      });

      console.log(`Total appointments for doctor ${doctorId}: ${allAppointments.length}`);
      console.log("Appointment statuses:", allAppointments.map(a => a.status));

      // For now, let's use all appointments regardless of status
      appointments = allAppointments;
    }

    // Transform the data to match frontend expectations
    const patientsMap = new Map(); // Use Map to avoid duplicates

    appointments.forEach((appointment) => {
      console.log(`Appointment ${appointment.id}: parent=${appointment.parentId}, children=${appointment.parent?.children?.length || 0}`);

      if (appointment.parent?.children) {
        appointment.parent.children.forEach((child) => {
          if (!patientsMap.has(appointment.id)) {
            patientsMap.set(appointment.id, {
              id: child.id,
              firstName: child.name.split(" ")[0] || "",
              lastName: child.name.split(" ").slice(1).join(" ") || "",
              name: child.name,
              email: appointment.parent.email || "",
              phone: appointment.parent.phone || "",
              profilePicture: child.avatar || `https://i.pravatar.cc/150?u=${child.id}`,
              status: appointment.status,
              lastVisit: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString() : null,
              medicalConditions: [], // Child model doesn't have medical conditions
              chatId: null, // Will be set if chat exists
              hasChat: false, // Will be checked below
              appointmentId: appointment.id,
              appointmentStatus: appointment.status
            });
          }
        });
      }
    });

    const patients = Array.from(patientsMap.values());
    console.log(`Returning ${patients.length} patients`);

    // Check for existing chats for each patient
    for (const patient of patients) {
      // Find the parent of this patient
      const patientWithParents = await prisma.child.findUnique({
        where: { id: patient.id },
        include: { parents: true },
      });

      if (patientWithParents?.parents[0]) {
        const parentId = patientWithParents.parents[0].id;

        // Check if there's a chat between this parent and doctor
        const existingChat = await prisma.chat.findFirst({
          where: {
            AND: [
              {
                chatParticipants: {
                  some: { parentId: parentId }
                }
              },
              {
                chatParticipants: {
                  some: { doctorId: doctorId }
                }
              }
            ]
          }
        });

        if (existingChat) {
          patient.hasChat = true;
          patient.chatId = existingChat.id;
        }
      }
    }

    return NextResponse.json(
      { success: true, data: patients },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
