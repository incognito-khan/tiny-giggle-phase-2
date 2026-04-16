import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * POST /api/v1/doctors/chats
 * Create or get existing chat between doctor and patient
 * Body: { patientId, title }
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
    const { patientId, title } = await request.json();

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

    // Check if chat already exists between this parent and doctor
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

    if (existingChat) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: existingChat.id,
            _id: existingChat.id,
            title: existingChat.title,
            createdAt: existingChat.createdAt,
          },
        },
        { status: 200 }
      );
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        title: title || `Chat with ${patient.name}`,
        creatorId: parentId, // Parent creates the chat
      },
    });

    // Add participants to the chat
    await prisma.chatParticipant.createMany({
      data: [
        {
          chatId: chat.id,
          parentId: parentId, // Parent participant
        },
        {
          chatId: chat.id,
          doctorId: doctorId, // Doctor participant
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: chat.id,
          _id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/doctors/chats
 * Fetch all chats for a doctor
 */
export async function GET(request) {
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

    // Get all chats where this doctor is a participant
    const chatParticipants = await prisma.chatParticipant.findMany({
      where: { doctorId: doctorId },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: "desc",
        },
      },
    });

    // Transform to match expected format
    const chats = chatParticipants.map(cp => ({
      id: cp.chat.id,
      title: cp.chat.title,
      createdAt: cp.chat.createdAt,
      updatedAt: cp.chat.updatedAt,
      messages: cp.chat.messages,
      parent: cp.parent, // The parent in the chat
    }));

    return NextResponse.json(
      { success: true, data: chats },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
