import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ musicId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { musicId } = await params;
        const music = await prisma.music.findUnique({
            where: { id: musicId },
            select: {
                id: true,
                title: true,
                mimeType: true,
                url: true,
                size: true,
                type: true,
                price: true,
                thumbnail: true,
                isDeleted: true,
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                subCategory: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!music || music.isDeleted) {
            return Res.badRequest({ message: "Music Not Found" })
        }

        return Res.success({
            message: "Music fetched successfully",
            data: music,
        });
    } catch (error) {
        console.error("Music fetch error:", error);
        return Res.serverError();
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ musicId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { musicId } = await params;
        if (!musicId) {
            return Res.badRequest({ message: "musicId is required" });
        }

        await prisma.musicFavorite.deleteMany({
            where: { musicId },
        });

        // await prisma.purchasedMusic.updateMany({
        //     where: { musicId },
        //     data: {
        //         isDeleted: true,
        //         deletedAt: new Date()
        //     }
        // })

        await prisma.music.update({
            where: { id: musicId },
            data: { 
                isDeleted: true,
                deletedAt: new Date()
             }
        });
        return Res.success({
            message: "Music deleted successfully",
            data: musicId,
        });
    } catch (error) {
        console.error("Music deletion error:", error);
        return Res.serverError();
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ musicId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { musicId } = await params;
        if (!musicId) {
            return Res.badRequest({ message: "musicId is required" });
        }
        const body = await req.json();
        const { title, type, price, thumbnail, categoryId, subCategoryId } = body;
        if (!title || !type) {
            return Res.badRequest({ message: "Please provide all required fields" });
        }

        if (type === 'PAID' && (!price || price <= 0)) {
            return Res.badRequest({ message: "Please provide a valid price for PAID music" });
        }

        const updatedMusic = await prisma.music.update({
            where: { id: musicId },
            data: {
                title,
                type,
                price: type === 'PAID' ? price : 0,
                thumbnail,
                categoryId,
                subCategoryId
            },
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
        });
        return Res.success({
            message: "Music updated successfully",
            data: updatedMusic,
        });
    } catch (error) {
        console.error("Music update error:", error);
        return Res.serverError();
    }
}