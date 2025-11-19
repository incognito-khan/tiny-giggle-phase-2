"use server";

import { prisma } from "@/lib/prisma";

export async function getParentById(id: string) {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id },
    });
    return parent;
  } catch (error) {
    return null;
  }
}
