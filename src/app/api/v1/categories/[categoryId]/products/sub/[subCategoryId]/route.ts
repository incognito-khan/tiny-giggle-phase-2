import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ categoryId: string; subCategoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { categoryId, subCategoryId } = await params;
        if (!categoryId) {
            return Res.badRequest({ message: "CategoryId is required." })
        }
        if (!subCategoryId) {
            return Res.badRequest({ message: "subCategoryId is required." })
        }
        const body = await req.json();
        console.log(body, 'body')
        console.log(categoryId, 'categoryId')
        const { name, slug, image, costPrice, salePrice, quantity, taxPercent, listedBy } = body;

        // Validate
        if (!categoryId || !name || !slug || salePrice === undefined ||
            quantity === undefined ||
            taxPercent === undefined) {
            return Res.badRequest({
                message: "CategoryId, name, slug, salePrice, quantity and taxPercent are required",
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                image,
                costPrice,
                salePrice,
                quantity,
                taxPercent,
                categoryId,
                subCategoryId,
                listedById: listedBy,
                isDeleted: false
            },
            include: {
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
                },
                listedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return Res.success({
            message: "Product created successfully",
            data: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.image,
                costPrice: product.costPrice,
                salePrice: product.salePrice,
                quantity: product.quantity,
                taxPercent: product.taxPercent,
                category: product.category,
                subCategory: product.subCategory,
                listedBy: product.listedBy
            },
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            return Res.error({
                message: "Slug already exists",
                status: 409,
            });
        }
        return Res.serverError();
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ subCategoryId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { subCategoryId } = await params;

        if (!subCategoryId) {
            return Res.badRequest({
                message: "CategoryId is required",
            });
        }

        const products = await prisma.product.findMany({
            where: { subCategoryId, isDeleted: false },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                costPrice: true,
                salePrice: true,
                quantity: true,
                taxPercent: true,
                createdAt: true,
                updatedAt: true,
                listedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
        });

        return Res.success({
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error) {
        return Res.serverError();
    }
}