import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const { name, slug, adminId, status } = body;

    if (!name || !slug || !adminId || !status) {
      return Res.badRequest({ message: "Name, status, slug and adminId are required" });
    }

    const category = await prisma.musicCategory.create({
      data: {
        name,
        slug,
        adminId,
        status: status || "ACTIVE",
        isDeleted: false
      },
      // include: {
      //   _count: {
      //     select: { musics: true },
      //   },
      // },
    });

    const musicCount = await prisma.music.count({
      where: {
        categoryId: category.id,
        isDeleted: false,
      },
    });

    const categoryWithCount = {
      ...category,
      _count: { musics: musicCount },
    };

    return Res.success({
      message: "Music Category created successfully",
      data: categoryWithCount
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
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim();

    // Build where clause
    const whereClause: any = { isDeleted: false };
    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    const musics = await prisma.music.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        mimeType: true,
        url: true,
        size: true,
        type: true,
        price: true,
        thumbnail: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return Res.success({
      message: "All music fetched successfully",
      data: musics,
    });
  } catch (error) {
    console.error("Music fetch error:", error);
    return Res.serverError();
  }
}