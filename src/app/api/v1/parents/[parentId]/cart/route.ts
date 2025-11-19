import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ parentId: string }> }) {
    try {
        const { parentId } = await params;

        if (!parentId) return Res.badRequest({ message: "Parent ID is required" });

        let cart: any;

        const existingParent = await prisma.cart.findFirst({
            where: { parentId }
        });

        if (existingParent) {
            cart = await prisma.cart.findFirst({ where: { parentId, isDeleted: false } });
        }

        const existingRelative = await prisma.cart.findFirst({
            where: { relativeId: parentId, isDeleted: false }
        })

        if (existingRelative) {
            cart = await prisma.cart.findFirst({ where: { relativeId: parentId, isDeleted: false } });
        }

        if (!cart || cart.isDeleted) return Res.notFound({ message: "Cart not found" });

        // Get all cart items with product details
        const cartItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id, isDeleted: false },
            select: {
                id: true,
                quantity: true,
                price: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                        costPrice: true,
                        salePrice: true,
                        quantity: true,
                        category: { select: { id: true, name: true } },
                    }
                },
            },
        });

        return Res.ok({ message: "Cart items fetched successfully", data: cartItems });

    } catch (error) {
        console.error("Cart GET error:", error);
        return Res.serverError();
    }
}
