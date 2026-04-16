import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * POST /api/v1/parents/chats/check
 * Check if a chat already exists between parent and doctor/sitter
 * Body: { doctorOrSitterId, professionalType }
 * professionalType: "doctor" | "sitter"
 */
export async function POST(request) {
  try {
    // Extract parent ID from JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "parent") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const parentId = payload.id;
    const { doctorOrSitterId, professionalType } = await request.json();

    // Support doctor and babysitter chats
    if (professionalType !== "doctor" && professionalType !== "babysitter") {
      return NextResponse.json(
        { success: false, message: "Only doctor and babysitter chats are supported at this time" },
        { status: 400 }
      );
    }

    // Check if chat exists between this parent and doctor
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            chatParticipants: {
              some: { parentId: parentId }
            }
          },
          {
            chatParticipants: {
              some: professionalType === "doctor"
                ? { doctorId: doctorOrSitterId }
                : { babysitterId: doctorOrSitterId }
            }
          }
        ]
      }
    });

    return NextResponse.json(
      {
        success: true,
        exists: !!existingChat,
        data: existingChat ? { id: existingChat.id, _id: existingChat.id } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking chat:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
