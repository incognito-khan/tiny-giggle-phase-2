import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ categoryId: string; subCategoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { categoryId, subCategoryId } = await params;
        const body = await req.json();
        const { title, url, mimeType, size, uploadedBy, type, price, thumbnail } = body;

        // Validation
        if (!title || !url || !mimeType || !size) {
            return Res.badRequest({
                message: "title, url, mimeType, and size are required",
            });
        }

        const artist = await prisma.artist.findUnique({
            where: { id: uploadedBy }
        })

        if (!artist) {
            return Res.notFound({ message: "Artist Not Found!" })
        }

        // Music create
        const music = await prisma.music.create({
            data: {
                title,
                url,
                mimeType,
                size,
                type,
                price,
                thumbnail,
                isDeleted: false,
                uploadedBy: {
                    connect: {
                        id: uploadedBy,
                    },
                },
                category: {
                    connect: { id: categoryId },
                },
                subCategory: {
                    connect: { id: subCategoryId },
                },
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

        return Res.created({
            message: "Music created successfully",
            data: music
        });
    } catch (error) {
        console.error("Music create error:", error);
        return Res.serverError();
    }
}