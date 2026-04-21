import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

export async function DELETE(req, { params }) {
  try {
    const auth = await verifyAccessTokenFromRequest(req);
    if (!auth.success) return Res.unauthorized();

    const { id } = await params;
    const userId = auth.data.id;

    // Check if answer exists and belongs to the user
    const answer = await prisma.communityAnswer.findUnique({
      where: { id }
    });

    if (!answer) {
      return Res.notFound({ message: "Answer not found" });
    }

    if (answer.authorId !== userId && auth.data.role !== 'admin') {
      return Res.forbidden({ message: "You are not authorized to delete this answer" });
    }

    // Physical delete
    await prisma.communityAnswer.delete({
      where: { id }
    });

    return Res.ok({ message: "Answer deleted successfully" });
  } catch (error) {
    console.error("Community answer DELETE error:", error);
    return Res.serverError();
  }
}
