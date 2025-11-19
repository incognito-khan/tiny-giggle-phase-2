import { NextRequest, NextResponse } from "next/server";
const { OAuth2Client } = require("google-auth-library");
import { prisma } from "@/lib/prisma";
import { createAccessToken } from "@/lib/tokens";

// Google OAuth2 client setup
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json()

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        // Google se verify karo
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
        }

        const email = payload.email;

        // Check if Parent exists
        const existingParent = await prisma.parent.findUnique({
            where: { email },
            include: {
                children: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                    },
                },
                folders: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        ownerId: true,
                        subfolders: {
                            select: {
                                id: true
                            }
                        },
                        createdAt: true
                    }
                },
                carts: {
                    where: { isDeleted: false },
                    select: {
                        items: {
                            where: { isDeleted: false },
                            select: {
                                id: true,
                                cartId: true,
                                productId: true,
                                quantity: true,
                                price: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                        salePrice: true,
                                        category: { select: { id: true, name: true } },
                                    },
                                },
                            },
                        },
                    },
                }
            },
        });

        if (!existingParent && existingParent.isDeleted) {
            return NextResponse.json({ error: "No account found" }, { status: 404 });
        }

        const accessToken = await createAccessToken(existingParent);

        // Agar account hai to success return karo
        return NextResponse.json({
            message: "Login successful",
            data: {
                user: {
                    id: existingParent.id,
                    name: existingParent.name,
                    email: existingParent.email,
                    role: 'parent',
                    childs: existingParent.childIds,
                    folders: existingParent.folders,
                    carts: existingParent.carts
                },
                tokens: { accessToken }
            }
        });
    } catch (error) {
        console.error("Google login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
