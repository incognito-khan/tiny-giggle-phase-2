import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent id is required" });
    }
    // const { success, message } = await verifyAccessTokenFromRequest(req);
    // if (!success) {
    //   return Res.unauthorized({ message });
    // }
    const parentDetail = await prisma.parent.findUnique({
      where: { id: parentId },
      omit: {
        password: true,
        childIds: true,
      },
    });
    if (!parentDetail) {
      return Res.notFound({ message: "No detail found" });
    }

    return Res.ok({ message: "Data fetch successfully", data: parentDetail });
  } catch (error) {
    return Res.serverError();
  }
}
