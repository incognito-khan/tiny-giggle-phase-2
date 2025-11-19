import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { NextRequest } from "next/server";

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ parentId: string }> }
// ) {
//   try {
//     const { success, message } = await verifyAccessTokenFromRequest(req);
//     if (!success) {
//       return Res.unauthorized({ message });
//     }

//     const { parentId } = await params;
//     if (!parentId) {
//       return Res.badRequest({ message: "Parent ID is required" });
//     }

//     const body = await req.json();
//     const { title, participants } = body;

//     if (!title) {
//       return Res.badRequest({
//         message: "Chat title is required",
//       });
//     }
//     if (!participants) {
//       return Res.badRequest({
//         message: "Participants are required",
//       });
//     }

//     const existingParent = await prisma.parent.findUnique({
//       where: { id: parentId },
//     });

//     if (!existingParent) {
//       return Res.notFound({ message: "Invalid creatorId provided" });
//     }

//     // Ensure creator is always included
//     const allParticipantIds = Array.from(
//       new Set([parentId, ...(participants || [])])
//     );

//     const chat = await prisma.chat.create({
//       data: {
//         title,
//         creatorId: parentId,
//         chatParticipants: {
//           create: allParticipantIds.map((parentId: string) => ({
//             parentId,
//           })),
//         },
//       },
//       include: {
//         chatParticipants: {
//           include: {
//             parent: {
//               select: { id: true, name: true, email: true },
//             },
//           },
//         },
//       },
//     });

//     return Res.created({
//       message: "Chat created successfully",
//       data: chat,
//     });
//   } catch (error) {
//     console.error("Chat creation error:", error);
//     return Res.serverError();
//   }
// }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    const { success, message } = await verifyAccessTokenFromRequest(req);
    if (!success) return Res.unauthorized({ message });


    const { parentId } = await params;
    if (!parentId) return Res.badRequest({ message: "Parent ID is required" });


    const body = await req.json();
    const { title, participants } = body;


    if (!title) return Res.badRequest({ message: "Chat title is required" });
    if (!participants) return Res.badRequest({ message: "Participants are required" });


    const existingParent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!existingParent) return Res.notFound({ message: "Invalid creatorId provided" });


    // Ensure creator is always included
    const allParticipantIds = Array.from(new Set([parentId, ...(participants || [])]));


    const participantsData = [];


    for (const pid of allParticipantIds) {
      const parent = await prisma.parent.findUnique({ where: { id: pid } });
      const childRel = await prisma.childRelation.findUnique({ where: { id: pid } });


      if (!parent && !childRel) {
        return Res.badRequest({ message: `Invalid participant ID: ${pid}` });
      }


      participantsData.push({
        parentId: parent ? pid : null,
        childRelationId: childRel ? pid : null,
      });
    }


    const chat = await prisma.chat.create({
      data: {
        title,
        creatorId: parentId,
        chatParticipants: {
          create: participantsData,
        },
      },
      include: {
        chatParticipants: {
          include: {
            parent: {
              select: { id: true, name: true, email: true },
            },
            childRelation: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });


    return Res.created({
      message: "Chat created successfully",
      data: chat,
    });
  } catch (error) {
    console.error("Chat creation error:", error);
    return Res.serverError();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    const { success, message } = await verifyAccessTokenFromRequest(req);
    if (!success) {
      return Res.unauthorized({ message });
    }

    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required" });
    }

    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (existingParent) {
      const chats = await prisma.chat.findMany({
        where: {
          chatParticipants: {
            some: { parentId },
          },
        },
        include: {
          chatParticipants: {
            select: {
              parent: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          // messages: {
          //   take: 1,
          //   orderBy: { createdAt: "desc" },
          //   select: {
          //     id: true,
          //     message: true,
          //     chatParticipantId: true,
          //     createdAt: true,
          //   },
          // },
        },
        orderBy: { updatedAt: "desc" },
      });

      return Res.ok({
        message: "Chats fetched successfully",
        data: chats,
      });
    }

    const existingRelative = await prisma.childRelation.findUnique({
      where: { id: parentId },
    });

    if (existingRelative) {
      const chats = await prisma.chat.findMany({
        where: {
          chatParticipants: {
            some: { childRelationId: parentId },
          },
        },
        include: {
          chatParticipants: {
            select: {
              parent: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          // messages: {
          //   take: 1,
          //   orderBy: { createdAt: "desc" },
          //   select: {
          //     id: true,
          //     message: true,
          //     chatParticipantId: true,
          //     createdAt: true,
          //   },
          // },
        },
        orderBy: { updatedAt: "desc" },
      });

      return Res.ok({
        message: "Chats fetched successfully",
        data: chats,
      });
    }

    if (!existingParent && !existingRelative) {
      return Res.notFound({ message: "Invalid User provided" });
    }




  } catch (error) {
    console.error("Fetch chats error:", error);
    return Res.serverError();
  }
}
