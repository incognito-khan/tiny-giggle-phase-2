import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const result = await verifyAccessTokenFromRequest(req);
    if (!result.success) {
      return Res.unauthorized({ message: result.message });
    }
    const user = result.data;

    if (user.role !== "supplier") {
      return Res.forbidden({ message: "Only suppliers can access this." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Supplier Account Activation Fee",
              description: "Annual membership fee to activate your professional supplier account.",
            },
            unit_amount: 8000, // $80.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/admin-dashboard/settings?session_id={CHECKOUT_SESSION_ID}&type=SUPPLIER_ACTIVATION`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/admin-dashboard/settings?tab=activation`,
      metadata: {
        supplierId: user.id,
        type: "SUPPLIER_ACTIVATION",
      },
    });

    return Res.ok({ message: "Checkout session created", data: { url: session.url } });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error.message);
    return Res.serverError({ message: error.message });
  }
}
