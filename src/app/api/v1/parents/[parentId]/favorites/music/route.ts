import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { NextRequest } from "next/server";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string) {
    const key = url.includes("amazonaws.com")
        ? url.split(".amazonaws.com/")[1]
        : url;

    return getPresignedUrl(key);
}

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

                const favoriteWithSignedUrls = {
                    ...favorite,
                    music: {
                        ...favorite.music,
                        thumbnail: await signUrl(favorite.music.thumbnail),
                        url: await signUrl(favorite.music.url),
                    },
                };

                return Res.created({
                    message: "Added to favorites",
                    data: favoriteWithSignedUrls,
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

                const flattenedFavoriteWithSignedUrls = {
                    ...flattenedFavorite,
                    thumbnail: await signUrl(flattenedFavorite.thumbnail),
                    url: await signUrl(flattenedFavorite.url),
                };

                return Res.created({
                    message: "Added to favorites",
                    data: flattenedFavoriteWithSignedUrls,
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

        const favoritesWithSignedUrls = await Promise.all(
            flattenedFavorites.map(async (music) => ({
                ...music,
                thumbnail: await signUrl(music.thumbnail),
                url: await signUrl(music.url),
            })),
        );

        return Res.success({
            message: "Favorites fetched successfully",
            data: favoritesWithSignedUrls,
        });
    } catch (error) {
        console.error("Favorites GET error:", error);
        return Res.serverError();
    }
}
