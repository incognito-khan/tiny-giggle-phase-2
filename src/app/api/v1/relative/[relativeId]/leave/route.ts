import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ relativeId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { relativeId } = await params;
        if (!relativeId) {
            return Res.badRequest({ message: "Relative ID is required" });
        }

        await prisma.cart.updateMany({
            where: { relativeId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        await prisma.musicFavorite.deleteMany({
            where: { relativeId }
        })

        await prisma.productFavorite.deleteMany({
            where: { relativeId }
        })

        await prisma.order.updateMany({
            where: { relativeId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        await prisma.purchasedMusic.updateMany({
            where: { relativeId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        await prisma.message.deleteMany({
            where: { relativeId }
        })

        await prisma.relativeOTP.deleteMany({
            where: { relativeId }
        })

        await prisma.childRelation.update({
            where: { id: relativeId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        return Res.success({ message: "Relative leaved successfully", data: relativeId })

    } catch (error) {
        console.log(error.message);
        return Res.serverError({ message: "Internal Server Error" });
    }
}
