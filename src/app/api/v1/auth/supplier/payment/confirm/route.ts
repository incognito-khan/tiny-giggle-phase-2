import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
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

    if (session.payment_status === "paid" && session.metadata?.type === "SUPPLIER_ACTIVATION") {
      const supplierId = session.metadata.supplierId;

      if (supplierId !== user.id) {
        return Res.forbidden({ message: "Payment does not belong to this user" });
      }

      const updatedSupplier = await prisma.supplier.update({
        where: { id: supplierId },
        data: {
          isPaid: true,
          status: "ACTIVE",
          paidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      return Res.ok({ message: "Account activated successfully!", data: updatedSupplier });
    }

    return Res.badRequest({ message: "Payment not completed" });
  } catch (error: any) {
    console.error("Stripe Confirmation Error:", error.message);
    return Res.serverError({ message: error.message });
  }
}
