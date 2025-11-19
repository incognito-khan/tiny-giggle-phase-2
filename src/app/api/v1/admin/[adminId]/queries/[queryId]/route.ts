import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; queryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, queryId } = await params;
    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required" });
    }
    if (!queryId) {
      return Res.badRequest({ message: "Query ID is required" });
    }

    const query = await prisma.query.findUnique({
      where: { id: queryId },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        status: true,
        priority: true,
        createdAt: true,
        parent: {
            select: {
                id: true,
                name: true
            }
        }
      }
    });

    return Res.ok({ message: "Query fetched successfully", data: query });
  } catch (error) {
    console.error(error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; queryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, queryId } = await params;
    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required" });
    }
    if (!queryId) {
      return Res.badRequest({ message: "Query ID is required" });
    }

    const { priority, status } = await req.json()

    const updatedQuery = await prisma.query.update({
        where: { id: queryId },
        data: {
            status,
            priority
        }
    })

    return Res.success({ message: "Query Updated Successfully", data: updatedQuery })
  } catch (error) {
    console.error(error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string; queryId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId, queryId } = await params;
    if (!adminId) {
      return Res.badRequest({ message: "Admin ID is required" });
    }
    if (!queryId) {
      return Res.badRequest({ message: "Query ID is required" });
    }

    await prisma.query.delete({
        where: { id: queryId }
    })

    return Res.success({ message: "Query Deleted Successfully", data: queryId })
  } catch (error) {
    console.error(error);
    return Res.serverError({ message: "Internal Server Error" });
  }
}