import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * POST /api/v1/doctors/chats/check
 * Check if a chat already exists between doctor and patient
 * Body: { patientId }
 */
export async function POST(request) {
  try {
    // Extract doctor ID from JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (!payload || payload.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const doctorId = payload.id;
    const { patientId } = await request.json();

    // Find the parent of this patient
    const patient = await prisma.child.findUnique({
      where: { id: patientId },
      include: {
        parents: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    const parentId = patient.parents[0]?.id;
    if (!parentId) {
      return NextResponse.json(
        { success: false, message: "No parent found for this patient" },
        { status: 404 }
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
              some: { doctorId: doctorId }
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
