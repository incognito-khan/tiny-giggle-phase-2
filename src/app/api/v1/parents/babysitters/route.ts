import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

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

    if (city && city !== "all") {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { certifications: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 4. Fetch Data
    const [babysitters, total] = await Promise.all([
      prisma.babysitter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          experience: true,
          hourlyRate: true,
          profilePictureUrl: true,
          bio: true,
          ageGroups: true,
          languages: true,
          isVerified: true,
          paymentCollectionMethod: true
        }
      }),
      prisma.babysitter.count({ where })
    ]);

    // 5. Return Response
    return Res.ok({
      message: "Babysitters fetched successfully",
      data: {
        babysitters,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Fetch babysitters error:", error);
    return Res.serverError();
  }
}
