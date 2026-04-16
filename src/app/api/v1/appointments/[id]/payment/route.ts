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

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: "COMPLETED",
        // We can automatically move status if needed, but usually it stays PENDING until doctor accepts
      }
    });

    return Res.ok({ 
      message: "Payment processed successfully", 
      data: updated 
    });

  } catch (error) {
    console.error("Payment error:", error);
    return Res.serverError();
  }
}
