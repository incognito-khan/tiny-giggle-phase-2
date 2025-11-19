"use server";

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function createMessage({
  title,
  parentId,
  description,
  role,
}: {
  title: string;
  parentId?: string;
  description?: string;
  role?: string;
}): Promise<ApiResponse> {
  try {
    if (!title) {
      return { success: false, message: "Title is required " };
    }
    if (role === 'parent') {
      await prisma.message.create({
        data: {
          title,
          description,
          parentId,
        },
      });
    }

    if (role === 'supplier') {
      await prisma.message.create({
        data: {
          title,
          description,
          supplierId: parentId,
        },
      });
    }

    if (role === 'artist') {
      await prisma.message.create({
        data: {
          title,
          description,
          artistId: parentId,
        },
      });
    }

    if (role === 'admin') {
      await prisma.message.create({
        data: {
          title,
          description,
          adminId: parentId,
        },
      });
    }

    if (role === 'relative') {
      await prisma.message.create({
        data: {
          title,
          description,
          relativeId: parentId,
        },
      });
    }
    //  else {
    //   await prisma.message.create({
    //     data: {
    //       title,
    //       description,
    //     },
    //   });
    // }
    return { success: true, message: "Message created succesfully" };
  } catch (error) {
    return { success: false, message: "Internal server error" };
  }
}
