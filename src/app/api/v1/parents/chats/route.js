import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * POST /api/v1/parents/chats
 * Create or get existing chat between parent and doctor/sitter
 * Body: { doctorOrSitterId, professionalType, title }
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
    const { doctorOrSitterId, professionalType, title } = await request.json();

    // Support doctor and babysitter chats
    if (professionalType !== "doctor" && professionalType !== "babysitter") {
      return NextResponse.json(
        { success: false, message: "Only doctor and babysitter chats are supported at this time" },
        { status: 400 }
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
              some: professionalType === "doctor"
                ? { doctorId: doctorOrSitterId }
                : { babysitterId: doctorOrSitterId }
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
        title: title || `Chat with doctor`,
        creatorId: parentId,
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
          ...(professionalType === "doctor"
            ? { doctorId: doctorOrSitterId }
            : { babysitterId: doctorOrSitterId }),
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
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/parents/chats
 * Fetch all chats for a parent
 */
export async function GET(request) {
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

    // Get all chats where this parent is a participant (only doctor chats for now)
    const chatParticipants = await prisma.chatParticipant.findMany({
      where: { parentId: parentId },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        babysitter: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
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
      doctor: cp.doctor, // The doctor in the chat if any
      babysitter: cp.babysitter, // The babysitter in the chat if any
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
