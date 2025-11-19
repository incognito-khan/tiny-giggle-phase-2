import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ relativeId: string; productId: string }> }
) {
    try {
        const { relativeId, productId } = await params;
        const body = await req.json();
        const { quantity } = body;

        if (!relativeId) {
            return Res.badRequest({ message: "Relative ID is required" });
        }

        if (!productId) {
            return Res.badRequest({ message: "Product ID is required" });
        }

        if (!quantity) {
            return Res.badRequest({ message: "Quantity is required" });
        }

        const existingRelation = await prisma.childRelation.findUnique({
            where: { id: relativeId },
        });

        if (!existingRelation) {
            return Res.notFound({ message: "Relation not found" });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                salePrice: true,
                isDeleted: true
            }
        });

        if (!existingProduct || existingProduct.isDeleted) {
            return Res.notFound({ message: "Product not found" });
        }

        let cart = await prisma.cart.findFirst({
            where: { relativeId: relativeId },
            select: {
                id: true,
                isDeleted: true
            }
        });

        if (!cart || cart.isDeleted) {
            cart = await prisma.cart.create({
                data: { relativeId: relativeId }
            });
        }

        let existingCartItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, isDeleted: false }
        });

        // const totalPrice = existingProduct.salePrice * quantity;
        const newQuantity = existingCartItem
            ? existingCartItem.quantity + quantity
            : quantity;

        const totalPrice = existingProduct.salePrice * newQuantity;

        const cartItem = await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
                isDeleted: false
            },
            update: {
                quantity: newQuantity,
                price: totalPrice,
                isDeleted: false
            },
            create: {
                cartId: cart.id,
                productId,
                quantity,
                price: totalPrice,
                isDeleted: false
            },
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

        return Res.ok({
            message: existingCartItem
                ? "Cart item updated successfully"
                : "Product added to cart successfully",
            data: {
                cartItem,
                type: existingCartItem
                    ? 'update'
                    : 'add'
            },
        });
    } catch (error) {
        console.error("Cart item creation error:", error);
        return Res.serverError();
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string; relativeId: string }> }) {
    try {
        const { productId, relativeId } = await params;
        const body = await req.json();
        const { reduceBy } = body;
        console.log(reduceBy, "reduceBy")

        if (!relativeId) return Res.badRequest({ message: "User ID is required" });
        if (!productId) return Res.badRequest({ message: "Product ID is required" });
        if (!reduceBy || reduceBy <= 0) return Res.badRequest({ message: "Reduce amount must be positive" });

        // Find cart
        let cart = await prisma.cart.findFirst({
            where: { relativeId: relativeId },
            select: {
                id: true,
                isDeleted: true
            }
        });
        if (!cart || cart.isDeleted) return Res.notFound({ message: "Cart not found" });

        // Find cart item
        const cartItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
            select: {
                id: true,
                quantity: true,
                isDeleted: true
            }
        });
        if (!cartItem || cartItem.isDeleted) return Res.notFound({ message: "Product not in cart" });

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                salePrice: true,
                isDeleted: true
            }
        });
        if (!product || product.isDeleted) return Res.notFound({ message: "Product not found" });

        // Reduce quantity or delete
        const newQuantity = cartItem.quantity - reduceBy;
        if (newQuantity > 0) {
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: cartItem.id, isDeleted: false },
                data: {
                    quantity: newQuantity,
                    price: product.salePrice * newQuantity,
                },
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
            return Res.ok({
                message: "Cart item quantity reduced", data: updatedCartItem
            });
        } else {
            await prisma.cartItem.delete({ where: { id: cartItem.id } });
            return Res.ok({ message: "Cart item removed" });
        }

    } catch (error) {
        console.error("Cart PATCH error:", error);
        return Res.serverError();
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ relativeId: string; productId: string }> }) {
    try {
        const { relativeId, productId } = await params;

        if (!relativeId) return Res.badRequest({ message: "Parent ID is required" });
        if (!productId) return Res.badRequest({ message: "Product ID is required" });

        const cart = await prisma.cart.findFirst({
            where: { relativeId: relativeId },
            select: {
                id: true,
                isDeleted: true
            }
        });
        if (!cart || cart.isDeleted) return Res.notFound({ message: "Cart not found" });

        const cartItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
            select: {
                id: true,
                quantity: true,
                isDeleted: true
            }
        });
        if (!cartItem || cartItem.isDeleted) return Res.notFound({ message: "Product not in cart" });

        await prisma.cartItem.update({ 
            where: { id: cartItem.id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        return Res.ok({ message: "Cart item removed successfully", data: productId });

    } catch (error) {
        console.error("Cart DELETE error:", error);
        return Res.serverError();
    }
}