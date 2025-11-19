import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; musicId: string; }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId } = await params;

        if (!parentId) {
            return Res.badRequest({ message: "User ID is required!" })
        }

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId }
        })

        if (existingParent) {
            const music = await prisma.purchasedMusic.findMany({
                where: { parentId, isDeleted: false },
                select: {
                    id: true,
                    purchasedAt: true,
                    music: {
                        select: {
                            id: true,
                            title: true,
                            mimeType: true,
                            url: true,
                            size: true,
                            type: true,
                            price: true,
                            thumbnail: true,
                            uploadedBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            category: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            },
                            subCategory: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
            })

            return Res.ok({ message: "Purchased Music Fetched Successfully", data: music })
        }

        const existingRelative = await prisma.childRelation.findUnique({
            where: { id: parentId }
        })

        if (existingRelative) {
            const music = await prisma.purchasedMusic.findMany({
                where: { relativeId: parentId, isDeleted: false },
                select: {
                    id: true,
                    purchasedAt: true,
                    music: {
                        select: {
                            id: true,
                            title: true,
                            mimeType: true,
                            url: true,
                            size: true,
                            type: true,
                            price: true,
                            thumbnail: true,
                            uploadedBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            category: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            },
                            subCategory: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
            })

            return Res.ok({ message: "Purchased Music Fetched Successfully", data: music })
        }

        if (!existingParent && !existingRelative) {
            return Res.notFound({ message: "User not found" })
        };

    } catch (error) {
        console.error(error.message);
        return Res.serverError({ message: "Internal Server Error" });
    }

}