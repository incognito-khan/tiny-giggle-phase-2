import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId, orderId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "COMPLETED",
          orderStatus: "CONFIRMED",
        }
      });
      return NextResponse.json({ message: "Order updated successfully", success: true });
    }

    return NextResponse.json({ error: "Payment not completed", success: false }, { status: 400 });
  } catch (error: any) {
    console.error("Payment verification error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
