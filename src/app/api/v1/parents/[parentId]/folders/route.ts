import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ parentId: string }> }) {
  try {
    const { parentId: ownerId } = await params;
    if (!ownerId) {
      return Res.badRequest({ message: "ownerId is required." })
    }
    const { parentId, name } = await req.json();

    if (!name || !ownerId) {
      return Res.badRequest({ message: "name and ownerId are required" });
    }

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        return Res.notFound({ message: "Parent folder not found" });
      }

      if (parentFolder.type !== "PERSONAL") {
        return Res.badRequest({
          message: "Subfolders can only be created under PERSONAL folders",
        });
      }
    }

    const existingFolder = await prisma.folder.findFirst({
      where: {
        ownerId,
        parentId: parentId || null,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingFolder) {
      return Res.badRequest({
        message: "A folder with this name already exists in the same location",
      });
    }

    // ✅ Create new subfolder
    const newFolder = await prisma.folder.create({
      data: {
        name,
        type: "PERSONAL",
        parentId: parentId || null,
        ownerId,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        type: true,
        ownerId: true,
        parentId: true,
        createdAt: true,
      },
    });

    return Res.ok({
      message: "Folder Created Successfully",
      data: newFolder,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    const { parentId: ownerId } = await params;
    console.log(ownerId, 'ownerId')

    if (!ownerId) {
      return Res.badRequest({ message: "ownerId is required" });
    }

    // ✅ Fetch only Personal & Shared root folders with subfolders + images
    const folders = await prisma.folder.findMany({
      where: {
        ownerId,
        type: { in: ["PERSONAL", "SHARED"] },
        parentId: null,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        type: true,
        ownerId: true,
        parentId: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            name: true,
            url: true,
            createdAt: true,
          },
        },
        subfolders: {
          select: {
            id: true,
            name: true,
            type: true,
            ownerId: true,
            parentId: true,
            createdAt: true,
            images: {
              select: {
                id: true,
                name: true,
                url: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const foldersWithCount = folders.map((folder) => {
      const ownImagesCount = folder.images.length;
      const subfolderImagesCount = folder.subfolders.reduce(
        (sum, sub) => sum + sub.images.length,
        0
      );
      return {
        ...folder,
        imageCount: ownImagesCount + subfolderImagesCount,
      };
    });

    return Res.ok({
      message: "Personal & Shared folders fetched successfully",
      data: foldersWithCount,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}