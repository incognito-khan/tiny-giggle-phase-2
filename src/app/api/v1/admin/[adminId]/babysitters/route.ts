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
            name, email, phone, city, state, zipCode, experience, ageGroups, languages, 
            certifications, bio, hourlyRate, profilePictureUrl,
            nationalIdUrl, firstAidCertificateUrl, backgroundCheckUrl, childcareDiplomaUrl, referenceLettersUrl
        } = await req.json();

        if (!name || !email || !experience) {
            return Res.badRequest({ message: "Required fields are missing." });
        }

        const password = nanoid(8);
        const hashedPassword = await hashing(password);

        const babysitter = await prisma.babysitter.create({
            data: {
                name,
                email,
                phone,
                city,
                state,
                zipCode,
                experience: parseInt(experience) || 0,
                ageGroups,
                languages,
                certifications,
                bio,
                hourlyRate: parseFloat(hourlyRate) || 0,
                password: hashedPassword,
                profilePictureUrl,
                nationalIdUrl,
                firstAidCertificateUrl,
                backgroundCheckUrl,
                childcareDiplomaUrl,
                referenceLettersUrl,
                isVerified: true,
                isPaid: false,
                isDeleted: false
            }
        });

        await sendEmail(email, "new-vendor-account", {
            name,
            email,
            password,
            role: "Babysitter"
        });

        const signedBs = await signBabysitterUrls(babysitter);

        return Res.created({ message: "Babysitter created successfully! Login credentials sent to email.", data: signedBs });

    } catch (error: any) {
        console.error("Admin Babysitter Create Error:", error);
        if (error.code === 'P2002') {
            return Res.badRequest({ message: "Email already exists" });
        }
        return Res.serverError({ message: "Failed to create babysitter" });
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
                { email: { contains: search, mode: "insensitive" } }
            ];
        }

        const [babysitters, total] = await Promise.all([
            prisma.babysitter.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.babysitter.count({ where: whereClause })
        ]);

        const bsWithSignedUrls = await Promise.all(
            babysitters.map(async (bs) => await signBabysitterUrls(bs))
        );

        return Res.ok({ 
            message: "Babysitters fetched successfully", 
            data: {
                babysitters: bsWithSignedUrls,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            } 
        });

    } catch (error) {
        console.error("Admin Babysitters Fetch Error:", error);
        return Res.serverError({ message: "Failed to fetch babysitters" });
    }
}
