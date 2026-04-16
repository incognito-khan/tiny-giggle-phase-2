import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

const ROLE_MAP = {
  admin: "ADMIN",
  parent: "PARENT",
  doctor: "DOCTOR",
  babysitter: "BABYSITTER",
  artist: "ARTIST",
  supplier: "SUPPLIER",
  relative: "RELATIVE",
};

export async function POST(req) {
  try {
    const auth = await verifyAccessTokenFromRequest(req);
    if (!auth.success) return Res.unauthorized();

    const body = await req.json();
    const { questionId, answerId } = body;

    if (!questionId && !answerId) {
      return Res.badRequest({ message: "questionId or answerId is required" });
    }

    const userId = auth.data.id;
    const authorType = ROLE_MAP[auth.data.role.toLowerCase()] || "PARENT";

    const where = {
      userId,
      ...(questionId ? { questionId } : { answerId }),
    };

    const existingLike = await prisma.communityLike.findFirst({ where });

    if (existingLike) {
      try {
        await prisma.communityLike.delete({ where: { id: existingLike.id } });
        return Res.ok({ message: "Like removed", data: { liked: false } });
      } catch (err) {
        // If already deleted by another request
        return Res.ok({ message: "Like removed", data: { liked: false } });
      }
    } else {
      try {
        await prisma.communityLike.create({
          data: {
            userId,
            userType: authorType,
            ...(questionId ? { questionId } : { answerId }),
          },
        });
        return Res.ok({ message: "Liked successfully", data: { liked: true } });
      } catch (err) {
        // If created by another request in the meantime (P2002)
        if (err.code === 'P2002') {
          return Res.ok({ message: "Liked successfully", data: { liked: true } });
        }
        throw err;
      }
    }
  } catch (error) {
    console.error("Community like POST error:", error);
    return Res.serverError();
  }
}
