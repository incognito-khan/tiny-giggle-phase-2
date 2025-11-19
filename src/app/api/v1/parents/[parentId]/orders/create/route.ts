import { ApiResponse } from "@/lib/types";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

type Data = {
  shippingAddress: string;
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  stripePayment: Boolean;
  orderItems: {
    productId: string;
    quantity: number;
  }[];
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string; }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required" });
    }
    const {
      shippingAddress,
      totalPrice,
      orderStatus,
      paymentStatus,
      orderItems,
      stripePayment = false
    }: Data = await req.json();
    if (
      !shippingAddress ||
      !totalPrice ||
      !orderStatus ||
      !paymentStatus ||
      !orderItems
    ) {
      return Res.badRequest({ message: "All fields are required" });
    }

    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId }
    })

    if (existingParent) {
      const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const trackingNumber = `ORD-${timestamp}${random}`;
      const order = await prisma.order.create({
        data: {
          trackingNumber,
          parentId,
          shippingAddress,
          totalPrice,
          orderStatus,
          paymentStatus,
          isDeleted: false
        },
      });
      // Create all order items
      await Promise.all(
        orderItems.map((item) =>
          prisma.orderItem.create({
            data: {
              quantity: item.quantity,
              productId: item.productId,
              orderId: order.id,
            },
          })
        )
      );

      if (stripePayment) {
        const line_items = orderItems.map((item: any) => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.name, images: [item.image] },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items,
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
        });

        return Res.created({ message: "Order has been created", url: session.url });
      }


      return Res.created({ message: "Order has been created", data: order });
    }

    const existingRelative = await prisma.childRelation.findUnique({
      where: { id: parentId }
    })

    if (existingRelative) {
      const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const trackingNumber = `ORD-${timestamp}${random}`;
      const order = await prisma.order.create({
        data: {
          trackingNumber,
          relativeId: parentId,
          shippingAddress,
          totalPrice,
          orderStatus,
          paymentStatus,
          isDeleted: false
        },
      });
      // Create all order items
      await Promise.all(
        orderItems.map((item) =>
          prisma.orderItem.create({
            data: {
              quantity: item.quantity,
              productId: item.productId,
              orderId: order.id,
            },
          })
        )
      );
      return Res.created({ message: "Order has been created", data: order });
    }

  } catch (error) {
    console.error(error)
    return Res.serverError({ message: "Internal Server Error" });
  }
}
