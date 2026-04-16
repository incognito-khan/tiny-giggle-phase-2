import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { getPresignedUrl } from "@/lib/helpers/s3";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const authResult = await verifyAccessTokenFromRequest(req);
    if (!authResult.success) {
      return Res.unauthorized({ message: authResult.message });
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const specialty = searchParams.get("specialty");
    const mode = searchParams.get("mode"); // CLINIC, HOME, BOTH
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // 3. Build Filter Object
    const where: any = {
      isDeleted: false,
      // Temporarily relaxing these filters so data appears for testing
      // isVerified: true,
      // isPaid: true, 
    };

    if (specialty && specialty !== "all") {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    if (mode && mode !== "all") {
      if (mode === "BOTH") {
        where.serviceMode = "BOTH";
      } else {
        where.OR = [
          { serviceMode: mode },
          { serviceMode: "BOTH" }
        ];
      }
    }

    if (city && city !== "all") {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 4. Fetch Data
    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          specialty: true,
          city: true,
          state: true,
          yearsOfExperience: true,
          consultationFee: true,
          paymentCollectionMethod: true,
          serviceMode: true,
          profilePicture: true,
          bio: true,
        }
      }),
      prisma.doctor.count({ where })
    ]);

    // 5. Sign profile picture URLs (bucket is private)
    const signedDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        let signedPicture = doctor.profilePicture;
        if (signedPicture && signedPicture.startsWith("http")) {
          try {
            const url = new URL(signedPicture);
            const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
            signedPicture = await getPresignedUrl(key);
          } catch {
            signedPicture = null;
          }
        }
        return { ...doctor, profilePicture: signedPicture };
      })
    );

    // 6. Return Response
    return Res.ok({
      message: "Doctors fetched successfully",
      data: {
        doctors: signedDoctors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Fetch doctors error:", error);
    return Res.serverError();
  }
}
