import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { nanoid } from "nanoid";
import { hashing } from "@/lib/helpers/hash";
import { sendEmail } from "@/actions/send-email";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        const { name, cnic, email, country, state, city, status, subscription, categoryId, subCategoryId } = await req.json();

        if (!name || !cnic || !email || !country || !state || !city || !status || !categoryId || !subCategoryId) {
            return Res.badRequest({ message: "All fields are requried." });
        }

        const password = nanoid(8);

        const hashedPassword = await hashing(password)

        const supplier = await prisma.supplier.create({
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
                subCategoryId,
                password: hashedPassword,
                isDeleted: false
            },
            select: {
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

        await sendEmail(email, "new-vendor-account", {
            name,
            email,
            password,
            role: "Supplier"
        });

        return Res.created({ message: "Supplier created successsfully! Login credentials has been sent to your email.", data: supplier })

    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to create vaccination" })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        const url = new URL(req.url);
        const search = url.searchParams.get("search")?.trim();

        const whereClause: any = { isDeleted: false };
        if (search) {
            whereClause.name = { contains: search, mode: "insensitive" };
        }

        const suppliers = await prisma.supplier.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                cnic: true,
                email: true,
                country: true,
                state: true,
                city: true,
                subscription: true,
                status: true,
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

        return Res.ok({ message: "Suppliers fetched successsfully", data: suppliers })

    } catch (error) {
        console.error(error)
        return Res.serverError({ message: "Failed to create vaccination" })
    }
}