import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAccessTokenFromRequest(req as any);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await params;
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

      const isTinyGiggle = appointment.paymentMethod === "TINY_GIGGLE";

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
          paymentStatus: "COMPLETED",
          status: isTinyGiggle ? "ACCEPTED" : appointment.status,
          paymentReference: sessionId,
        },
      });

      // If Tiny Giggle, automatically create chat session
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
          console.error("Chat creation error in stripe confirmation:", chatError);
        }
      }

      return NextResponse.json({ success: true, message: "Payment confirmed successfully", data: updated });
    } else {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Appointment Payment Confirmation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
