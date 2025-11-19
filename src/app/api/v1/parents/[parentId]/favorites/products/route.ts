import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string }> }
) {
    try {
        const { success, message } = await verifyAccessTokenFromRequest(req);
        if (!success) {
            return Res.unauthorized({ message });
        }

        const { parentId } = await params;
        if (!parentId) {
            return Res.badRequest({ message: "Creator ID is required" });
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return Res.badRequest({
                message: "Music ID is required",
            });
        }

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId },
        });

        if (existingParent) {
            const existingFavorite = await prisma.productFavorite.findUnique({
                where: {
                    parentId_productId: {
                        parentId,
                        productId,
                    },
                },
            });

            let favorite: any;

            if (existingFavorite) {
                await prisma.productFavorite.delete({
                    where: {
                        parentId_productId: {
                            parentId,
                            productId,
                        },
                    },
                });
                return Res.success({
                    message: "Removed from favorites",
                    data: null,
                });
            } else {
                favorite = await prisma.productFavorite.create({
                    data: {
                        parentId,
                        productId,
                    },
                });
                return Res.created({
                    message: "Added to favorites",
                    data: favorite,
                });
            }
        }

        const existingRelative = await prisma.childRelation.findUnique({
            where: { id: parentId },
        });

        if (existingRelative) {
            const existingFavorite = await prisma.productFavorite.findUnique({
                where: {
                    relativeId_productId: {
                        relativeId: parentId,
                        productId,
                    },
                },
            });

            let favorite: any;

            if (existingFavorite) {
                await prisma.productFavorite.delete({
                    where: {
                        relativeId_productId: {
                            relativeId: parentId,
                            productId,
                        },
                    },
                });
                return Res.success({
                    message: "Removed from favorites",
                    data: null,
                });
            } else {
                favorite = await prisma.productFavorite.create({
                    data: {
                        relativeId: parentId,
                        productId,
                    },
                });
                return Res.created({
                    message: "Added to favorites",
                    data: favorite,
                });
            }
        }

        if (!existingParent && !existingRelative) {
            return Res.notFound({ message: "Invalid creatorId provided" });
        }

    } catch (error) {
        console.error("Product favorite error:", error);
        return Res.serverError();
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string }> }
) {
    try {
        const { parentId } = await params;

        if (!parentId) {
            return Res.badRequest({ message: "parentId is required" });
        }

        // First check if this ID belongs to a parent
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

        // Fetch favorites depending on who the user is (parent or relative)
        const favorites = await prisma.productFavorite.findMany({
            where: existingParent
                ? {
                    parentId,
                    NOT: {
                        productId: null,
                    },
                }
                : {
                    relativeId: parentId,
                    NOT: {
                        productId: null,
                    },
                },
            include: {
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
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return Res.success({
            message: "Favorites fetched successfully",
            data: favorites,
        });
    } catch (error) {
        console.error("Favorites GET error:", error);
        return Res.serverError();
    }
}


// export async function GET(
//     req: NextRequest,
//     { params }: { params: Promise<{ parentId: string }> }
// ) {
//     try {
//         const { parentId } = await params;

//         if (!parentId) {
//             return Res.badRequest({ message: "parentId is required" });
//         }

//         const favorites = await prisma.favorite.findMany({
//             where: {
//                 parentId,
//                 NOT: {
//                     productId: null,
//                 },
//             },
//             include: {
//                 product: {
//                     select: {
//                         id: true,
//                         name: true,
//                         slug: true,
//                         image: true,
//                         costPrice: true,
//                         salePrice: true,
//                         quantity: true,
//                         taxPercent: true,
//                         createdAt: true,
//                         updatedAt: true,
//                         listedBy: {
//                             select: {
//                                 id: true,
//                                 name: true
//                             }
//                         }
//                     },
//                 },
//             },
//             orderBy: { createdAt: "desc" },
//         });

//         return Res.success({
//             message: "Favorites fetched successfully",
//             data: favorites,
//         });
//     } catch (error) {
//         console.error("Favorites GET error:", error);
//         return Res.serverError();
//     }
// }
