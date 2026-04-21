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

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const question = await prisma.communityQuestion.findUnique({
      where: { id, isDeleted: false },
      include: {
        _count: {
          select: { likes: true, answers: true }
        }
      },
    });

    if (!question) {
      return Res.notFound({ message: "Question not found" });
    }

    // Increment view count
    await prisma.communityQuestion.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Check for user likes if authenticated
    const auth = await verifyAccessTokenFromRequest(req);
    let questionWithLike = { ...question, isLiked: false };
    if (auth.success) {
      const userId = auth.data.id;
      
      // Check question like
      const questionLike = await prisma.communityLike.findFirst({
        where: { userId, questionId: id }
      });
      questionWithLike.isLiked = !!questionLike;
    }

    // Sign author avatar — fall back to live lookup if stored avatar is null
    const avatarUrl = questionWithLike.authorAvatar || await liveAvatar(questionWithLike.authorId, questionWithLike.authorType);
    const signedQuestion = {
      ...questionWithLike,
      authorAvatar: await signUrl(avatarUrl)
    };

    return Res.ok({ 
      data: signedQuestion
    });
  } catch (error) {
    console.error("Community question single GET error:", error);
    return Res.serverError();
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await verifyAccessTokenFromRequest(req);
    if (!auth.success) return Res.unauthorized();

    const { id } = await params;
    const userId = auth.data.id;

    // Check if question exists and belongs to the user
    const question = await prisma.communityQuestion.findUnique({
      where: { id }
    });

    if (!question) {
      return Res.notFound({ message: "Question not found" });
    }

    if (question.authorId !== userId && auth.data.role !== 'admin') {
      return Res.forbidden({ message: "You are not authorized to delete this question" });
    }

    // Physical delete will cascade to answers and likes
    await prisma.communityQuestion.delete({
      where: { id }
    });

    return Res.ok({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Community question DELETE error:", error);
    return Res.serverError();
  }
}
