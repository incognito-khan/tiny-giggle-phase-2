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
        const { musicId } = body;

        if (!musicId) {
            return Res.badRequest({
                message: "Music ID is required",
            });
        }

        const existingParent = await prisma.parent.findUnique({
            where: { id: parentId },
        });

        if (existingParent) {
            const existingFavorite = await prisma.musicFavorite.findUnique({
                where: {
                    parentId_musicId: {
                        parentId,
                        musicId,
                    },
                },
            });

            let favorite: any;

            if (existingFavorite) {
                await prisma.musicFavorite.delete({
                    where: {
                        parentId_musicId: {
                            parentId,
                            musicId,
                        },
                    },
                });
                return Res.success({
                    message: "Removed from favorites",
                    data: null,
                });
            } else {
                favorite = await prisma.musicFavorite.create({
                    data: {
                        parentId,
                        musicId,
                    },
                    select: {
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
            const existingFavorite = await prisma.musicFavorite.findUnique({
                where: {
                    relativeId_musicId: {
                        relativeId: parentId,
                        musicId,
                    },
                },
            });

            let favorite: any;

            if (existingFavorite) {
                await prisma.musicFavorite.delete({
                    where: {
                        relativeId_musicId: {
                            relativeId: parentId,
                            musicId,
                        },
                    },
                });
                return Res.success({
                    message: "Removed from favorites",
                    data: null,
                });
            } else {
                favorite = await prisma.musicFavorite.create({
                    data: {
                        relativeId: parentId,
                        musicId,
                    },
                    select: {
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
                });
                const flattenedFavorite = favorite.music;
                return Res.created({
                    message: "Added to favorites",
                    data: flattenedFavorite,
                });
            }
        }

        if (!existingParent && !existingRelative) {
            return Res.notFound({ message: "Invalid creatorId provided" });
        }

    } catch (error) {
        console.error("Toggle Favorite error:", error);
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

        const favorites = await prisma.musicFavorite.findMany({
            where: existingParent
                ? {
                    parentId,
                    NOT: {
                        musicId: null,
                    },
                }
                : {
                    relativeId: parentId,
                    NOT: {
                        musicId: null,
                    },
                },
            select: {
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

        const flattenedFavorites = favorites
            .map((fav) => fav.music)
            .filter((m) => m !== null);

        return Res.success({
            message: "Favorites fetched successfully",
            data: flattenedFavorites,
        });
    } catch (error) {
        console.error("Favorites GET error:", error);
        return Res.serverError();
    }
}
