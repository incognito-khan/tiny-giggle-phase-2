import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; musicId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, musicId } = await params;

        const { paid = false } = await req.json();

        if (!parentId) {
            return Res.badRequest({ message: "User ID is required!" })
        }

        if (!musicId) {
            return Res.badRequest({ message: "Music ID is required!" })
        }

        const musicCheck = await prisma.music.findUnique({
            where: { id: musicId },
            select: { isDeleted: true }
        });

        if (!musicCheck || musicCheck.isDeleted) {
            return Res.badRequest({ message: "Music Not Found" })
        }

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId }
        })

        if (existingParent) {
            const existingMusic = await prisma.music.findUnique({
                where: { id: musicId }
            })

            if (!existingMusic) {
                return Res.notFound({ message: "Music Not Found" })
            }

            const existing = await prisma.purchasedMusic.findUnique({
                where: { parentId_musicId: { parentId, musicId }, isDeleted: false }
            })

            if (existing) {
                return Res.badRequest({ message: "Already Purchased!" })
            }

            const purchase = await prisma.purchasedMusic.create({
                data: {
                    parentId,
                    musicId,
                    isDeleted: false
                },
            });

            if (paid) {
                const line_items = [{
                    price_data: {
                        currency: "usd",
                        product_data: { name: existingMusic.title, images: [existingMusic.thumbnail] },
                        unit_amount: Math.round(existingMusic.price * 100),
                    },
                    quantity: 1,
                }]
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items,
                    mode: "payment",
                    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&purchaseId=${purchase.id}`,
                    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
                });

                return Res.created({ message: "Redirecting to secure payment..", url: session.url });
            }

            return Res.created({ message: "Music purchased successfully", data: purchase })
        }

        const existingRelative = await prisma.childRelation.findUnique({
            where: { id: parentId }
        })

        if (existingRelative) {
            const existingMusic = await prisma.music.findUnique({
                where: { id: musicId }
            })

            if (!existingMusic) {
                return Res.notFound({ message: "Music Not Found" })
            }

            const existing = await prisma.purchasedMusic.findUnique({
                where: { relativeId_musicId: { relativeId: parentId, musicId }, isDeleted: false }
            })

            if (existing) {
                return Res.badRequest({ message: "Already Purchased!" })
            }

            const purchase = await prisma.purchasedMusic.create({
                data: {
                    relativeId: parentId,
                    musicId,
                    isDeleted: false
                },
            });

            return Res.created({ message: "Music purchased successfully", data: purchase })
        }

        if (!existingParent && !existingRelative) {
            return Res.notFound({ message: "User not found" })
        }

    } catch (error) {
        console.error(error.message)
        return Res.serverError({ message: "Internal Server Error" });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ musicId: string; parentId: string }> }
) {
    const { parentId, musicId } = await params;

    const purchase = await prisma.purchasedMusic.findUnique({
        where: { parentId_musicId: { parentId, musicId } },
        select: { isDeleted: true }
    });
    if (!purchase || purchase.isDeleted) {
        return Res.badRequest({ message: "You do not own this music" });
    }

    const music = await prisma.music.findUnique({
        where: { id: musicId },
        select: { isDeleted: true, url: true, title: true }
    });
    if (!music || music.isDeleted) return Res.notFound({ message: "Music not found" });

    // Stream the file to the browser
    const response = await fetch(music.url);
    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
        headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `attachment; filename="${music.title}.mp3"`,
        },
    });
}
