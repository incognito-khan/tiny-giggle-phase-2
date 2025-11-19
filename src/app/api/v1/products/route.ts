import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim();

    // Build where clause
    const whereClause: any = {
      isDeleted: false
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
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Res.ok({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}
