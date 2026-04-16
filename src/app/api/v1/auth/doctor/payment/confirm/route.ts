import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover" as any,
});

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const response = await verifyAccessTokenFromRequest(req);

    if (!response.success || !response.data) {
      return Res.unauthorized({ message: "Unauthorized" });
    }

    const user = response.data;
    const { sessionId } = await req.json();

    if (!sessionId) {
      return Res.badRequest({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return Res.badRequest({ message: "Payment not verified" });
    }

    if (session.metadata?.type !== "DOCTOR_ACTIVATION") {
      return Res.badRequest({ message: "Invalid payment type" });
    }

    const doctorId = session.metadata.doctorId;

    if (doctorId !== user.id) {
        return Res.forbidden({ message: "Payment does not belong to this user" });
    }

    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        isPaid: true,
        paidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    return Res.ok({ message: "Doctor account activated successfully" });
  } catch (error) {
    console.error("Stripe Confirm Error:", error);
    return Res.serverError({ message: "Failed to confirm payment" });
  }
}
