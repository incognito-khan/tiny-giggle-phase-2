
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const { title, creatorId, participantIds } = body;

    if (!title || !creatorId) {
      return Res.badRequest({ message: "Title and creatorId are required" });
    }

    // Create chat with participants
    const chat = await prisma.chat.create({
      data: {
        title,
        creatorId,
        chatParticipants: {
          create: participantIds.map((pid: string) => ({
            parentId: pid,
          })),
        },
      },
      include: {
        chatParticipants: true,
      },
    });

    return Res.created({
      message: "Chat created successfully",
      data: chat,
    });
  } catch (error) {
    console.error(error);
    return Res.serverError();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ role: string; parentId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId } = await params;

    const url = new URL(req.url);
    const role = url.searchParams.get("role");

    if (!role || !parentId) {
      return Res.badRequest({ message: "Role and ID are required" });
    }

    // Determine which field to use based on role
    let whereClause = {};

    switch (role.toLowerCase()) {
      case "admin":
        whereClause = { adminId: parentId };
        break;
      case "supplier":
        whereClause = { supplierId: parentId };
        break;
      case "artist":
        whereClause = { artistId: parentId };
        break;
      case "relative":
        whereClause = { relativeId: parentId };
        break;
      default:
        whereClause = { parentId };
        break;
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      omit: {
        parentId: true,
        supplierId: true,
        artistId: true,
        relativeId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Res.ok({
      message: `Messages fetched successfully for ${role}`,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Res.serverError();
  }
}

