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

async function signDoctorUrls(doctor: any) {
    return {
        ...doctor,
        profilePicture: await signUrl(doctor.profilePicture),
        nationalId: await signUrl(doctor.nationalId),
        medicalLicense: await signUrl(doctor.medicalLicense),
        specialtyCertificate: await signUrl(doctor.specialtyCertificate),
        malpracticeInsurance: await signUrl(doctor.malpracticeInsurance),
        deaRegistration: await signUrl(doctor.deaRegistration)
    };
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string, doctorId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, doctorId } = await params;
        if (!adminId || !doctorId) {
            return Res.badRequest({ message: "Admin ID and Doctor ID are required" });
        }

        const body = await req.json();
        
        // Sanitize body to avoid updating sensitive or relational fields directly
        const { 
            id, createdAt, updatedAt, password, appointments, chatParticipants, ...updateData 
        } = body;

        // Ensure numeric fields are correctly typed
        if (updateData.yearsOfExperience) updateData.yearsOfExperience = parseInt(updateData.yearsOfExperience);
        if (updateData.consultationFee) updateData.consultationFee = parseFloat(updateData.consultationFee);

        const updatedDoctor = await prisma.doctor.update({
            where: { id: doctorId },
            data: updateData
        });

        const signedDoctor = await signDoctorUrls(updatedDoctor);

        return Res.ok({ message: "Doctor profile updated successfully", data: signedDoctor });

    } catch (error) {
        console.error("Admin Doctor Update Error:", error);
        return Res.serverError({ message: "Failed to update doctor" });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string, doctorId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId, doctorId } = await params;
        if (!adminId || !doctorId) {
            return Res.badRequest({ message: "Admin ID and Doctor ID are required" });
        }

        // Soft delete
        await prisma.doctor.update({
            where: { id: doctorId },
            data: { isDeleted: true, deletedAt: new Date() }
        });

        return Res.ok({ message: "Doctor deleted successfully", data: doctorId });

    } catch (error) {
        console.error("Admin Doctor Delete Error:", error);
        return Res.serverError({ message: "Failed to delete doctor" });
    }
}
