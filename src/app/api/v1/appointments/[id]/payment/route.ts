import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

// POST /api/v1/appointments/[id]/payment
// Mock payment processing
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAccessTokenFromRequest(req);
    if (!authResult.success) {
      return Res.unauthorized({ message: authResult.message });
    }

    const { id: userId } = authResult.data;
    const { id: appointmentId } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) return Res.notFound({ message: "Appointment not found" });
    if (appointment.parentId !== userId) return Res.forbidden({ message: "Unauthorized" });

    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isTinyGiggle = appointment.paymentMethod === "TINY_GIGGLE";

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: "COMPLETED",
        status: isTinyGiggle ? "ACCEPTED" : appointment.status,
      }
    });

    // If Tiny Giggle, automatically create chat session like in the status update route
    if (isTinyGiggle) {
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
                  { babysitterId: { in: participants } },
                  { childRelationId: { in: participants } }
                ]
              }
            }
          }
        });

        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              title: `Session with ${appointment.doctorId ? "Dr." : ""} ${appointment.doctorId ? "Doctor" : "Babysitter"}`,
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
            } else if (participantId === appointment.babysitterId) {
              await prisma.chatParticipant.create({
                data: {
                  chatId: chat.id,
                  babysitterId: participantId,
                }
              });
            }
          }
        }
      } catch (chatError) {
        console.error("Chat creation error in payment verification:", chatError);
      }
    }

    return Res.ok({ 
      message: "Payment processed successfully", 
      data: updated 
    });

  } catch (error) {
    console.error("Payment error:", error);
    return Res.serverError();
  }
}
