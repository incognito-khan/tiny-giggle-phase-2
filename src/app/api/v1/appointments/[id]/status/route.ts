import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

// PATCH /api/v1/appointments/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAccessTokenFromRequest(req);
    if (!authResult.success) {
      return Res.unauthorized({ message: authResult.message });
    }

    const { id: userId, role } = authResult.data;
    const { id: appointmentId } = await params;
    const { status, reportUrl, checkupReport } = await req.json();

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) return Res.notFound({ message: "Appointment not found" });

    // Authorization checks
    const isOwner = appointment.parentId === userId;
    const isProfessional = appointment.doctorId === userId || appointment.babysitterId === userId;

    if (!isOwner && !isProfessional) {
      return Res.forbidden({ message: "Unauthorized access" });
    }

    const updateData: any = {};

    if (status === "ACCEPTED") {
      if (!isProfessional) return Res.forbidden({ message: "Only professionals can accept appointments" });
      
      updateData.status = "ACCEPTED";
      updateData.sessionStartedAt = new Date();

      // Create a chat session automatically
      try {
        const participants = [];
        if (appointment.parentId) participants.push(appointment.parentId);
        if (appointment.doctorId) participants.push(appointment.doctorId);
        if (appointment.babysitterId) participants.push(appointment.babysitterId);

        // Check if chat already exists
        let chat = await prisma.chat.findFirst({
          where: {
            chatParticipants: {
              every: {
                OR: [
                  { parentId: { in: participants } },
                  { doctorId: { in: participants } },
                  { childRelationId: { in: participants } }
                ]
              }
            }
          }
        });

        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              title: `Session with ${role === 'doctor' ? 'Dr.' : ''} ${authResult.data.name}`,
            }
          });

          // Create chat participants
          for (const participantId of participants) {
            if (participantId === appointment.parentId) {
              await prisma.chatParticipant.create({
                data: {
                  chatId: chat.id,
                  parentId: participantId,
                }
              });
            } else if (participantId === appointment.doctorId) {
              await prisma.chatParticipant.create({
                data: {
                  chatId: chat.id,
                  doctorId: participantId,
                }
              });
            }
            // Note: Babysitter support not implemented in ChatParticipant model yet
          }
        }
      } catch (chatError) {
        console.error("Chat creation error:", chatError);
        // We don't fail the whole appointment acceptance if chat creation fails
      }
    } 
    
    else if (status === "REJECTED") {
      if (!isProfessional) return Res.forbidden({ message: "Only professionals can reject appointments" });
      updateData.status = "REJECTED";
    }

    else if (status === "CANCELLED") {
      updateData.status = "CANCELLED";
    }

    else if (status === "COMPLETED") {
      if (!isProfessional) return Res.forbidden({ message: "Only professionals can complete appointments" });
      updateData.status = "COMPLETED";
      updateData.sessionEndedAt = new Date();
      if (reportUrl) updateData.reportUrl = reportUrl;
      if (checkupReport) updateData.checkupReport = checkupReport;
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData
    });

    return Res.ok({ 
      message: `Appointment ${status.toLowerCase()} successfully`, 
      data: updated 
    });

  } catch (error) {
    console.error("Update appointment status error:", error);
    return Res.serverError();
  }
}
