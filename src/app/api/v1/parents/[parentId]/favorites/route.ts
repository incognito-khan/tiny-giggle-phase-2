import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string }> }
) {
    try {
        const { parentId } = await params;

        if (!parentId) {
            return Res.badRequest({ message: "parentId is required" });
        }

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId },
        });

        // If not a parent, check if it's a relative
        const existingRelative = existingParent
            ? null
            : await prisma.childRelation.findUnique({
                where: { id: parentId },
            });

        if (!existingParent && !existingRelative) {
            return Res.notFound({ message: "Invalid creatorId provided" });
        }

        const productFavorites = await prisma.productFavorite.findMany({
            where: existingParent
                ? {
                    parentId,
                }
                : {
                    relativeId: parentId,
                },
            include: {
                // music: {
                //     select: {
                //         id: true,
                //         title: true,
                //         url: true,
                //         thumbnail: true,
                //         uploadedBy: {
                //             select: {
                //                 name: true
                //             }
                //         },
                //         categoryId: true
                //     }
                // },
                product: {
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
                }
            },
            orderBy: { createdAt: "desc" },
        });

        const musicFavorites = await prisma.musicFavorite.findMany({
            where: existingParent
                ? {
                    parentId,
                }
                : {
                    relativeId: parentId,
                },
            include: {
                music: {
                    select: {
                        id: true,
                        title: true,
                        url: true,
                        thumbnail: true,
                        uploadedBy: {
                            select: {
                                name: true
                            }
                        },
                        categoryId: true
                    }
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return Res.success({
            message: "Favorites fetched successfully",
            data: { productFavorites, musicFavorites },
        });
    } catch (error) {
        console.error("Favorites GET error:", error);
        return Res.serverError();
    }
}
