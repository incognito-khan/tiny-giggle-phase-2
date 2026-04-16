import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url) {
  if (!url) return null;
  try {
    const key = url.includes("amazonaws.com")
      ? url.split(".amazonaws.com/")[1]
      : url;
    return getPresignedUrl(key);
  } catch {
    return null;
  }
}

/**
 * When authorAvatar is null (e.g., posted before avatar-capture logic existed),
 * dynamically fetch the author's current profile picture from their role table.
 */
async function liveAvatar(authorId, authorType) {
  try {
    const role = authorType?.toLowerCase();
    let pic = null;
    if (role === 'parent') {
      const u = await prisma.parent.findUnique({ where: { id: authorId }, select: { profilePicture: true } });
      pic = u?.profilePicture;
    } else if (role === 'doctor') {
      const u = await prisma.doctor.findUnique({ where: { id: authorId }, select: { profilePicture: true } });
      pic = u?.profilePicture;
    } else if (role === 'babysitter') {
      const u = await prisma.babysitter.findUnique({ where: { id: authorId }, select: { profilePictureUrl: true } });
      pic = u?.profilePictureUrl;
    } else if (role === 'artist') {
      const u = await prisma.artist.findUnique({ where: { id: authorId }, select: { profilePicture: true } });
      pic = u?.profilePicture;
    } else if (role === 'supplier') {
      const u = await prisma.supplier.findUnique({ where: { id: authorId }, select: { profilePicture: true } });
      pic = u?.profilePicture;
    } else if (role === 'admin') {
      const u = await prisma.admin.findUnique({ where: { id: authorId }, select: { profilePicture: true } });
      pic = u?.profilePicture;
    } else if (role === 'relative') {
      const u = await prisma.childRelation.findUnique({ where: { id: authorId }, select: { profilePicture: true } });
      pic = u?.profilePicture;
    }
    return pic || null;
  } catch {
    return null;
  }
}

// Mapping from token roles to Prisma enum CommunityUserType
const ROLE_MAP = {
  admin: "ADMIN",
  parent: "PARENT",
  doctor: "DOCTOR",
  babysitter: "BABYSITTER",
  artist: "ARTIST",
  supplier: "SUPPLIER",
  relative: "RELATIVE",
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type"); // filter by authorType
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        } : {},
        type ? { authorType: type } : {},
      ],
    };

    const [questions, total] = await Promise.all([
      prisma.communityQuestion.findMany({
        where,
        include: {
          _count: {
            select: { answers: true, likes: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.communityQuestion.count({ where }),
    ]);

    // Check for user likes if authenticated
    const auth = await verifyAccessTokenFromRequest(req);
    let questionsWithLikes = questions;
    
    if (auth.success) {
      const userId = auth.data.id;
      const userLikes = await prisma.communityLike.findMany({
        where: {
          userId,
          questionId: { in: questions.map(q => q.id) }
        },
        select: { questionId: true }
      });
      
      const likedQuestionIds = new Set(userLikes.map(l => l.questionId));
      questionsWithLikes = questions.map(q => ({
        ...q,
        isLiked: likedQuestionIds.has(q.id)
      }));
    } else {
      questionsWithLikes = questions.map(q => ({
        ...q,
        isLiked: false
      }));
    }

    // Sign author avatars — fall back to live lookup if stored avatar is null
    const signedQuestions = await Promise.all(
      questionsWithLikes.map(async (q) => {
        const avatarUrl = q.authorAvatar || await liveAvatar(q.authorId, q.authorType);
        return {
          ...q,
          authorAvatar: await signUrl(avatarUrl)
        };
      })
    );

    return Res.ok({
      data: {
        questions: signedQuestions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Community questions GET error:", error);
    return Res.serverError();
  }
}

export async function POST(req) {
  try {
    const auth = await verifyAccessTokenFromRequest(req);
    if (!auth.success) return Res.unauthorized();

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return Res.badRequest({ message: "Title and content are required" });
    }

    const userId = auth.data.id;
    const rawRole = auth.data.role;
    const authorType = ROLE_MAP[rawRole.toLowerCase()] || "PARENT";

    // Fetch user details to store name and avatar for quick display
    let authorName = auth.data.name;
    let authorAvatar = null;

    // Depending on role, fetch from specific table to get current profile picture
    const role = authorType.toLowerCase();
    if (role === 'parent') {
      const u = await prisma.parent.findUnique({ where: { id: userId }, select: { profilePicture: true } });
      authorAvatar = u?.profilePicture;
    } else if (role === 'doctor') {
      const u = await prisma.doctor.findUnique({ where: { id: userId }, select: { profilePicture: true } });
      authorAvatar = u?.profilePicture;
    } else if (role === 'babysitter') {
      const u = await prisma.babysitter.findUnique({ where: { id: userId }, select: { profilePictureUrl: true } });
      authorAvatar = u?.profilePictureUrl;
    } else if (role === 'artist') {
      const u = await prisma.artist.findUnique({ where: { id: userId }, select: { profilePicture: true } });
      authorAvatar = u?.profilePicture;
    } else if (role === 'supplier') {
      const u = await prisma.supplier.findUnique({ where: { id: userId }, select: { profilePicture: true } });
      authorAvatar = u?.profilePicture;
    } else if (role === 'admin') {
      const u = await prisma.admin.findUnique({ where: { id: userId }, select: { profilePicture: true } });
      authorAvatar = u?.profilePicture;
    } else if (role === 'relative') {
      const u = await prisma.childRelation.findUnique({ where: { id: userId }, select: { profilePicture: true } });
      authorAvatar = u?.profilePicture;
    }
    
    const question = await prisma.communityQuestion.create({
      data: {
        title,
        content,
        authorId: userId,
        authorType: authorType,
        authorName: authorName,
        authorAvatar: authorAvatar,
      },
    });

    const signedQuestion = {
      ...question,
      authorAvatar: await signUrl(question.authorAvatar)
    };

    return Res.ok({
      message: "Question posted successfully",
      data: signedQuestion,
    });
  } catch (error) {
    console.error("Community question POST error:", error);
    return Res.serverError();
  }
}
