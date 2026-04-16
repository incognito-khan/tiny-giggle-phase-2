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

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, babysitter: true }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const professionalName = appointment.doctor ? `Dr. ${appointment.doctor.name}` : appointment.babysitter?.name || "Professional";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Medical Consultation - ${professionalName}`,
              description: `Appointment fee for ${professionalName} on Tiny Giggle`,
            },
            unit_amount: Math.round(appointment.consultationFee * 100), // in cents
          },
          quantity: 1,
        }
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/parent-dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Appointment Stripe Checkout Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
