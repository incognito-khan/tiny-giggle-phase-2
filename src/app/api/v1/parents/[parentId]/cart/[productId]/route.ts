import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; productId: string }> }
) {
    try {
        const { parentId, productId } = await params;
        const body = await req.json();
        const { quantity } = body;

        if (!parentId) {
            return Res.badRequest({ message: "Parent ID is required" });
        }

        if (!productId) {
            return Res.badRequest({ message: "Product ID is required" });
        }

        if (!quantity) {
            return Res.badRequest({ message: "Quantity is required" });
        }

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId },
        });

        if (existingParent) {
            const existingProduct = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!existingProduct || existingProduct.isDeleted) {
                return Res.notFound({ message: "Product not found" });
            }

            let cart = await prisma.cart.findFirst({
                where: { parentId: parentId, isDeleted: false }
            });

            if (!cart || cart.isDeleted) {
                cart = await prisma.cart.create({
                    data: { parentId: parentId }
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
        }

        const existingRelative = await prisma.childRelation.findUnique({
            where: { id: parentId }
        });

        if (existingRelative) {
            const existingProduct = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!existingProduct || existingProduct.isDeleted) {
                return Res.notFound({ message: "Product not found" });
            }

            let cart = await prisma.cart.findFirst({
                where: { relativeId: parentId, isDeleted: false }
            });

            if (!cart || cart.isDeleted) {
                cart = await prisma.cart.create({
                    data: { relativeId: parentId }
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
        }

        if ((!existingParent || existingParent.isDeleted) && (!existingRelative || existingRelative.isDeleted)) {
            return Res.notFound({ message: "Creator not found" });
        }

    } catch (error) {
        console.error("Cart item creation error:", error);
        return Res.serverError();
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string; parentId: string }> }) {
    try {
        const { productId, parentId } = await params;
        const body = await req.json();
        const { reduceBy } = body;
        console.log(reduceBy, "reduceBy")

        if (!parentId) return Res.badRequest({ message: "User ID is required" });
        if (!productId) return Res.badRequest({ message: "Product ID is required" });
        if (!reduceBy || reduceBy <= 0) return Res.badRequest({ message: "Reduce amount must be positive" });
        let cart: any;

        const existingParent = await prisma.cart.findFirst({
            where: { parentId }
        });

        if (existingParent) {
            cart = await prisma.cart.findFirst({ where: { parentId } });
        }

        if (!existingParent) {
            const existingRelative = await prisma.cart.findFirst({
                where: { relativeId: parentId }
            })

            if (existingRelative) {
                cart = await prisma.cart.findFirst({ where: { relativeId: parentId } });
            }
        }

        if (!cart) return Res.notFound({ message: "Cart not found" });

        // Find cart item
        const cartItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });
        if (!cartItem) return Res.notFound({ message: "Product not in cart" });

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return Res.notFound({ message: "Product not found" });

        // Reduce quantity or delete
        const newQuantity = cartItem.quantity - reduceBy;
        if (newQuantity > 0) {
            const updatedCartItem = await prisma.cartItem.update({
                where: { id: cartItem.id },
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ parentId: string; productId: string }> }) {
    try {
        const { parentId, productId } = await params;

        if (!parentId) return Res.badRequest({ message: "Parent ID is required" });
        if (!productId) return Res.badRequest({ message: "Product ID is required" });

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId }
        });

        if (existingParent) {
            const cart = await prisma.cart.findFirst({ where: { parentId } });
            if (!cart) return Res.notFound({ message: "Cart not found" });

            const cartItem = await prisma.cartItem.findFirst({
                where: { cartId: cart.id, productId },
            });
            if (!cartItem) return Res.notFound({ message: "Product not in cart" });

            await prisma.cartItem.delete({ where: { id: cartItem.id } });
            return Res.ok({ message: "Cart item removed successfully", data: productId });
        }

        const existingRelative = await prisma.childRelation.findUnique({
            where: { id: parentId }
        });

        if (existingRelative) {
            const cart = await prisma.cart.findFirst({ where: { relativeId: parentId } });
            if (!cart) return Res.notFound({ message: "Cart not found" });

            const cartItem = await prisma.cartItem.findFirst({
                where: { cartId: cart.id, productId },
            });
            if (!cartItem) return Res.notFound({ message: "Product not in cart" });

            await prisma.cartItem.delete({ where: { id: cartItem.id } });
            return Res.ok({ message: "Cart item removed successfully", data: productId });
        }


    } catch (error) {
        console.error("Cart DELETE error:", error);
        return Res.serverError();
    }
}