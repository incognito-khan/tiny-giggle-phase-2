import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(url: string | null) {
    if (!url) return null;
    const key = url.includes("amazonaws.com")
        ? url.split(".amazonaws.com/")[1]
        : url;
    return getPresignedUrl(key);
}

async function signBabysitterUrls(bs: any) {
    return {
        ...bs,
        profilePictureUrl: await signUrl(bs.profilePictureUrl),
        nationalIdUrl: await signUrl(bs.nationalIdUrl),
        firstAidCertificateUrl: await signUrl(bs.firstAidCertificateUrl),
        backgroundCheckUrl: await signUrl(bs.backgroundCheckUrl),
        childcareDiplomaUrl: await signUrl(bs.childcareDiplomaUrl),
        referenceLettersUrl: await signUrl(bs.referenceLettersUrl)
    };
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string, babysitterId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, babysitterId } = await params;
        if (!adminId || !babysitterId) {
            return Res.badRequest({ message: "Admin ID and Babysitter ID are required" });
        }

        const body = await req.json();
        
        // Sanitize body to avoid updating sensitive or relational fields directly
        const { 
            id, createdAt, updatedAt, password, appointments, chatParticipants, availability, ...updateData 
        } = body;

        // Ensure numeric fields are correctly typed
        if (updateData.experience) updateData.experience = parseInt(updateData.experience);
        if (updateData.hourlyRate) updateData.hourlyRate = parseFloat(updateData.hourlyRate);

        const updatedBabysitter = await prisma.babysitter.update({
            where: { id: babysitterId },
            data: updateData
        });

        const signedBs = await signBabysitterUrls(updatedBabysitter);

        return Res.ok({ message: "Babysitter profile updated successfully", data: signedBs });

    } catch (error) {
        console.error("Admin Babysitter Update Error:", error);
        return Res.serverError({ message: "Failed to update babysitter" });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string, babysitterId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, babysitterId } = await params;
        if (!adminId || !babysitterId) {
            return Res.badRequest({ message: "Admin ID and Babysitter ID are required" });
        }

        // Soft delete
        await prisma.babysitter.update({
            where: { id: babysitterId },
            data: { isDeleted: true, deletedAt: new Date() }
        });

        return Res.ok({ message: "Babysitter deleted successfully", data: babysitterId });

    } catch (error) {
        console.error("Admin Babysitter Delete Error:", error);
        return Res.serverError({ message: "Failed to delete babysitter" });
    }
}
