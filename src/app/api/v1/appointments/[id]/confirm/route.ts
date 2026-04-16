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
      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: "COMPLETED" },
      });

      return NextResponse.json({ success: true, message: "Payment confirmed successfully", data: updated });
    } else {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Appointment Payment Confirmation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
