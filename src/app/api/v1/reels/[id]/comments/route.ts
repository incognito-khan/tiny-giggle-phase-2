import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { ReelUserType } from "@prisma/client";

const roleMap: Record<string, ReelUserType> = {
  parent: ReelUserType.PARENT,
  admin: ReelUserType.ADMIN,
  relative: ReelUserType.RELATIVE,
};

// GET /api/v1/reels/[id]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const result = await verifyAccessTokenFromRequest(req);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const { id } = await params;
    const reelId = id;

    const comments = await prisma.reelComment.findMany({
      where: { reelId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        authorName: true,
        authorAvatar: true,
        createdAt: true,
        userId: true,
      },
    });

    return NextResponse.json({
      data: comments,
      message: "Comments fetched successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch comments: ${err}` },
      { status: 500 },
    );
  }
}

// POST /api/v1/reels/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const result = await verifyAccessTokenFromRequest(req);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const userId = result.data.id;
    const userRole = result.data.role;
    const mappedRole = roleMap[userRole];

    if (!mappedRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reelId = id;
    const body = await req.json();
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    // Fetch author info
    let authorName = "User";
    let authorAvatar: string | null = null;

    if (userRole === "parent") {
      const parent = await prisma.parent.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      authorName = parent?.name ?? "Parent";
    } else if (userRole === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      authorName = admin?.name ?? "Admin";
    } else if (userRole === "relative") {
      const relative = await prisma.childRelation.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      authorName = relative?.name ?? "Relative";
    }

    const comment = await prisma.reelComment.create({
      data: {
        reelId,
        userId,
        userType: mappedRole,
        authorName,
        authorAvatar,
        text: text.trim(),
      },
      select: {
        id: true,
        text: true,
        authorName: true,
        authorAvatar: true,
        createdAt: true,
        userId: true,
      },
    });

    return NextResponse.json({
      data: comment,
      message: "Comment posted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to post comment: ${err}` },
      { status: 500 },
    );
  }
}
