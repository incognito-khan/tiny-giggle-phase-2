import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { Trykker } from "next/font/google";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; supplierId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, supplierId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        if (!supplierId) {
            return Res.badRequest({ message: "Please Provide Supplier ID" })
        }

        const { name, cnic, email, country, state, city, status, subscription, categoryId, subCategoryId } = await req.json();

        if (!name || !cnic || !email || !country || !state || !city || !status || !categoryId || !subCategoryId) {
            return Res.badRequest({ message: "All fields are requried." });
        }

        const supplier = await prisma.supplier.update({
            where: { id: supplierId },
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

        return Res.success({ message: "Supplier updated successsfully", data: supplier })

    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to create vaccination" })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string; supplierId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, supplierId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        if (!supplierId) {
            return Res.badRequest({ message: "Please Provide Supplier ID" })
        }

        // const music = await prisma.music.findMany({
        //     where: { uploadedById: supplierId }
        // })

        // if (music?.length > 0) {
        //     await prisma.music.deleteMany({
        //         where: { uploadedById: supplierId }
        //     })
        // }

        await prisma.supplier.update({
            where: { id: supplierId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        return Res.ok({ message: "Supplier deleted successsfully", data: supplierId })

    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to create vaccination" })
    }
}