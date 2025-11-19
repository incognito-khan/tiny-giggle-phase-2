import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId, purchaseId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      await prisma.purchasedMusic.update({
        where: { id: purchaseId },
        data: {
          purchasedAt: new Date()
        }
      });
      return NextResponse.json({ message: "Music purchased successfully", success: true });
    }

    return NextResponse.json({ error: "Payment not completed", success: false }, { status: 400 });
  } catch (error: any) {
    console.error("Payment verification error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}