import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { signS3Url } from "@/lib/helpers/s3";

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

    // ... (logic to handle no appointments) ...
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
      appointments = allAppointments;
    }

    // Transform the data to match frontend expectations
    const patients = [];

    for (const appointment of appointments) {
      if (appointment.parent?.children) {
        for (const child of appointment.parent.children) {
          // Sign report URL if exists
          const signedReportUrl = appointment.reportUrl ? await signS3Url(appointment.reportUrl) : null;

          patients.push({
            id: child.id,
            firstName: child.name.split(" ")[0] || "",
            lastName: child.name.split(" ").slice(1).join(" ") || "",
            name: child.name,
            email: appointment.parent.email || "",
            phone: appointment.parent.phone || "",
            profilePicture: child.avatar ? await signS3Url(child.avatar) : `https://i.pravatar.cc/150?u=${child.id}`,
            status: appointment.status,
            lastVisit: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString() : null,
            medicalConditions: [],
            chatId: null,
            hasChat: false,
            appointmentId: appointment.id,
            appointmentStatus: appointment.status,
            // Report fields
            reportUrl: signedReportUrl,
            diagnosis: appointment.diagnosis,
            prescription: appointment.prescription,
            extraNotes: appointment.extraNotes,
            checkupReport: appointment.checkupReport,
          });
        }
      }
    }

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
