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

const ROLE_MAP = {
  admin: "ADMIN",
  parent: "PARENT",
  doctor: "DOCTOR",
  babysitter: "BABYSITTER",
  artist: "ARTIST",
  supplier: "SUPPLIER",
  relative: "RELATIVE",
};

export async function GET(req, { params }) {
  try {
    const { id: questionId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      prisma.communityAnswer.findMany({
        where: { questionId, isDeleted: false },
        include: {
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.communityAnswer.count({
        where: { questionId, isDeleted: false }
      }),
    ]);

    // Check for user likes if authenticated
    const auth = await verifyAccessTokenFromRequest(req);
    let answersWithLikes = answers;

    if (auth.success) {
      const userId = auth.data.id;
      const answerLikes = await prisma.communityLike.findMany({
        where: {
          userId,
          answerId: { in: answers.map(a => a.id) }
        },
        select: { answerId: true }
      });
      const likedAnswerIds = new Set(answerLikes.map(l => l.answerId));
      answersWithLikes = answers.map(a => ({
        ...a,
        isLiked: likedAnswerIds.has(a.id)
      }));
    } else {
      answersWithLikes = answers.map(a => ({
        ...a,
        isLiked: false
      }));
    }

    // Sign author avatars — fall back to live lookup if stored avatar is null
    const signedAnswers = await Promise.all(
      answersWithLikes.map(async (a) => {
        const avatarUrl = a.authorAvatar || await liveAvatar(a.authorId, a.authorType);
        return {
          ...a,
          authorAvatar: await signUrl(avatarUrl)
        };
      })
    );

    return Res.ok({
      data: {
        answers: signedAnswers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Community answers paginated GET error:", error);
    return Res.serverError();
  }
}

export async function POST(req, { params }) {
  try {
    const { id: questionId } = await params;
    const auth = await verifyAccessTokenFromRequest(req);
    if (!auth.success) return Res.unauthorized();

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return Res.badRequest({ message: "Content is required" });
    }

    const userId = auth.data.id;
    const rawRole = auth.data.role;
    const authorType = ROLE_MAP[rawRole.toLowerCase()] || "PARENT";

    // Fetch user details to store avatar for quick display
    let authorAvatar = null;
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

    const answer = await prisma.communityAnswer.create({
      data: {
        content,
        questionId,
        authorId: userId,
        authorType: authorType,
        authorName: auth.data.name,
        authorAvatar: authorAvatar,
      },
    });

    const signedAnswer = {
      ...answer,
      authorAvatar: await signUrl(answer.authorAvatar)
    };

    return Res.ok({
      message: "Answer posted successfully",
      data: signedAnswer,
    });
  } catch (error) {
    console.error("Community answer POST error:", error);
    return Res.serverError();
  }
}
