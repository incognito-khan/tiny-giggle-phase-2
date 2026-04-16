import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * POST /api/v1/babysitters/chats/check
 * Check if a chat already exists between babysitter and parent (via patient/child)
 * Body: { patientId }
 */
export async function POST(request) {
  try {
    // Extract babysitter ID from JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "babysitter") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const babysitterId = payload.id;
    const { patientId, parentId: providedParentId } = await request.json();

    let parentId = providedParentId;

    if (!parentId) {
      // Find the parent of this child/patient
      const patient = await prisma.child.findUnique({
        where: { id: patientId },
        include: {
          parents: true,
        },
      });

      if (!patient) {
        return NextResponse.json(
          { success: false, message: "Child/Patient not found" },
          { status: 404 }
        );
      }

      parentId = patient.parents[0]?.id;
      if (!parentId) {
        return NextResponse.json(
          { success: false, message: "No parent found for this child" },
          { status: 404 }
        );
      }
    }

    // Check if chat exists between this parent and babysitter
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
              some: { babysitterId: babysitterId }
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
