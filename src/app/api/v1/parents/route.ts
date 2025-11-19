import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const parentsDetail = await prisma.parent.findMany({
        select: {
            id: true,
            name: true,
            email: true
        }
    });
    if (!parentsDetail) {
      return Res.notFound({ message: "No detail found" });
    }

    return Res.ok({ message: "Data fetch successfully", data: parentsDetail });
  } catch (error) {
    return Res.serverError();
  }
}
