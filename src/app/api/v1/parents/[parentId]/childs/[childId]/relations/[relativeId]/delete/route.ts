import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ parentId: string; childId: string; relativeId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { parentId, childId, relativeId } = await params;
        console.log(parentId, 'parentId');
        console.log(childId, 'childId');
        console.log(relativeId, 'relativeId');
        if (!parentId || !childId || !relativeId) {
            return Res.badRequest({ message: "Parent, Relative & Child ID is required" });
        }

        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            select: { id: true, name: true, childIds: true },
        });

        if (!parent || !parent.childIds.includes(childId)) {
            return Res.badRequest({ message: "This parent does not have the specified child." });
        }

        const childRelation = await prisma.childRelation.findFirst({
            where: {
                id: relativeId,
                childId: childId,
            },
        });

        if (!childRelation) {
            return Res.badRequest({ message: "This child does not have the specified relation." });
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

        return Res.success({ message: "Relative deleted successfully", data: relativeId })

    } catch (error) {
        console.log(error.message);
        return Res.serverError({ message: "Internal Server Error" });
    }
}
