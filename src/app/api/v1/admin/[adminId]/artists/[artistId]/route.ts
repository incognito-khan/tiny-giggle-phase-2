import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { Trykker } from "next/font/google";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; artistId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, artistId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        if (!artistId) {
            return Res.badRequest({ message: "Please Provide Artist ID" })
        }

        const { name, cnic, email, country, state, city, status, subscription, categoryId, subCategoryId } = await req.json();

        if (!name || !cnic || !email || !country || !state || !city || !status || !categoryId || !subCategoryId) {
            return Res.badRequest({ message: "All fields are requried." });
        }

        const artist = await prisma.artist.update({
            where: { id: artistId },
            data: {
                name,
                cnic,
                email,
                country,
                state,
                status,
                city,
                subscription,
                categoryId,
                subCategoryId
            },
            select: {
                id: true,
                name: true,
                cnic: true,
                email: true,
                country: true,
                state: true,
                status: true,
                city: true,
                subscription: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true
                    }
                },
                subCategory: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true
                    }
                }
            }
        })

        return Res.success({ message: "Artist updated successsfully", data: artist })

    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to update artist" })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; artistId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, artistId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        if (!artistId) {
            return Res.badRequest({ message: "Please Provide Artist ID" })
        }

        const music = await prisma.music.findMany({
            where: { uploadedById: artistId, isDeleted: false }
        })

        if (music?.length > 0) {
            await prisma.music.updateMany({
                where: { uploadedById: artistId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            })
        }

        await prisma.artist.update({
            where: { id: artistId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        return Res.ok({ message: "Artist deleted successsfully", data: artistId })

    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to delete artist" })
    }
}