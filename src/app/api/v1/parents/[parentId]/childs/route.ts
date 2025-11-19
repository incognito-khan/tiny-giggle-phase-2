import { Res } from "@/lib/general-response";
import { formatZodErrors } from "@/lib/helpers/zodErrorFormat";
import { prisma } from "@/lib/prisma";
import { childSchema } from "@/lib/schemas/child";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    // const { success, message } = await verifyAccessTokenFromRequest(req);
    // if (!success) {
    //   return Res.unauthorized({ message });
    // }
    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required" });
    }
    const childs = await prisma.child.findMany({
      where: {
        parents: {
          every: {
            id: parentId,
          },
        },
        isDeleted: false
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        parentIds: true,
      },
    });
    if (!childs) {
      return Res.notFound({ message: "No child found" });
    }
    return Res.ok({ message: "Data fetch successfully", data: childs });
  } catch (error) {
    return Res.serverError();
  }
}
