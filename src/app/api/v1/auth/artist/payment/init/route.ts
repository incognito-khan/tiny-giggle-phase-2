import { NextRequest, NextResponse } from "next/server";
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

    if (user.role !== "artist") {
      return Res.forbidden({ message: "Only artists can initialize activation payment" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Artist Account Activation",
              description: "Annual membership fee to activate your professional artist account",
            },
            unit_amount: 7500, // $75.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/admin-dashboard/settings?session_id={CHECKOUT_SESSION_ID}&type=ARTIST_ACTIVATION`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/admin-dashboard/settings?tab=activation`,
      metadata: {
        artistId: user.id,
        type: "ARTIST_ACTIVATION",
      },
    });

    return Res.ok({ message: "Checkout session created", data: { url: session.url } });
  } catch (error) {
    console.error("Stripe Init Error:", error);
    return Res.serverError({ message: "Failed to initialize payment" });
  }
}
