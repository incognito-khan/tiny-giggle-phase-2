import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

/**
 * POST /api/v1/babysitters/chats
 * Create or get existing chat between babysitter and parent
 * Body: { patientId, title }
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
    const { patientId, parentId: providedParentId, title } = await request.json();

    let parentId = providedParentId;
    let fallbackTitle = "Parent";

    if (!parentId) {
      // Find the parent of this patient (child)
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

      fallbackTitle = patient.name;
      parentId = patient.parents[0]?.id;
      
      if (!parentId) {
        return NextResponse.json(
          { success: false, message: "No parent found for this patient" },
          { status: 404 }
        );
      }
    }

    // Check if chat already exists between this parent and babysitter
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
        title: title || `Chat with ${fallbackTitle}`,
        creatorId: parentId, // Parent creates the chat logically
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
          babysitterId: babysitterId, // Babysitter participant
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
 * GET /api/v1/babysitters/chats
 * Fetch all chats for a babysitter
 */
export async function GET(request) {
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

    // Get all chats where this babysitter is a participant
    const chatParticipants = await prisma.chatParticipant.findMany({
      where: { babysitterId: babysitterId },
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
