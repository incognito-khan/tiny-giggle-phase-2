import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { NextRequest } from "next/server";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string) {
  const key = url.includes("amazonaws.com")
    ? url.split(".amazonaws.com/")[1]
    : url;

  return getPresignedUrl(key);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim();

    // Build where clause
    const whereClause: any = {
      isDeleted: false,
    };
    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const productsWithSignedUrls = await Promise.all(
      products.map(async (product) => ({
        ...product,
        image: await signUrl(product.image),
      })),
    );

    return Res.ok({
      message: "Products fetched successfully",
      data: productsWithSignedUrls,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}
