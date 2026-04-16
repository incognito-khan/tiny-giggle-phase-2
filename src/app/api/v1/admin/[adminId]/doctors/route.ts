import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { nanoid } from "nanoid";
import { hashing } from "@/lib/helpers/hash";
import { sendEmail } from "@/actions/send-email";
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        const {
            name, email, phone, city, state, zipCode, specialty, licenseNumber, 
            yearsOfExperience, consultationFee, serviceMode, bio, profilePicture,
            nationalId, medicalLicense, specialtyCertificate, malpracticeInsurance, deaRegistration
        } = await req.json();

        if (!name || !email || !specialty || !licenseNumber) {
            return Res.badRequest({ message: "Required fields are missing." });
        }

        const password = nanoid(8);
        const hashedPassword = await hashing(password);

        const doctor = await prisma.doctor.create({
            data: {
                name,
                email,
                phone,
                city,
                state,
                zipCode,
                specialty,
                licenseNumber,
                yearsOfExperience: parseInt(yearsOfExperience) || 0,
                consultationFee: parseFloat(consultationFee) || 0,
                serviceMode,
                bio,
                profilePicture,
                password: hashedPassword,
                nationalId,
                medicalLicense,
                specialtyCertificate,
                malpracticeInsurance,
                deaRegistration,
                isVerified: true,
                isPaid: false,
                isDeleted: false
            }
        });

        await sendEmail(email, "new-vendor-account", {
            name,
            email,
            password,
            role: "Doctor"
        });

        const signedDoctor = await signDoctorUrls(doctor);

        return Res.created({ message: "Doctor created successfully! Login credentials sent to email.", data: signedDoctor });

    } catch (error: any) {
        console.error("Admin Doctor Create Error:", error);
        if (error.code === 'P2002') {
            return Res.badRequest({ message: "Email already exists" });
        }
        return Res.serverError({ message: "Failed to create doctor" });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { adminId } = await params;
        if (!adminId) {
            return Res.badRequest({ message: "Please Provide Admin ID" })
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim();
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        const whereClause: any = { isDeleted: false };
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { specialty: { contains: search, mode: "insensitive" } }
            ];
        }

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.doctor.count({ where: whereClause })
        ]);

        const doctorsWithSignedUrls = await Promise.all(
            doctors.map(async (doc) => await signDoctorUrls(doc))
        );

        return Res.ok({ 
            message: "Doctors fetched successfully", 
            data: {
                doctors: doctorsWithSignedUrls,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            } 
        });

    } catch (error) {
        console.error("Admin Doctors Fetch Error:", error);
        return Res.serverError({ message: "Failed to fetch doctors" });
    }
}
