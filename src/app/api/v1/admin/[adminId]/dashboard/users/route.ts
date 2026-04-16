import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { ApiResponse } from "@/lib/types";
import { prepareUser } from "@/lib/prepare-user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminId } = await params;
    if (!adminId) return Res.badRequest({ message: "Please provide Admin ID" });

    // Fetch from all collections concurrently
    const [parents, artists, suppliers, doctors, babysitters] = await Promise.all([
      prisma.parent.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' } }),
      prisma.artist.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' } }),
      prisma.supplier.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' } }),
      prisma.doctor.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' } }),
      prisma.babysitter.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' } }),
    ]);

    // Normalize and sign user data
    const mapUser = async (user: any, role: string) => {
      const prepared = await prepareUser(user, role.toLowerCase());
      return {
        ...prepared,
        role: role, // Keep capitalized for UI
        isVerified: user.isVerified || false,
        isPaid: role === "Parent" ? false : (user.isPaid || false),
        status: user.status || "ACTIVE",
        createdAt: user.createdAt,
        phone: user.phone || null,
        details: user,
      };
    };

    const unifiedUsers = await Promise.all([
      ...parents.map((p: any) => mapUser(p, "Parent")),
      ...artists.map((a: any) => mapUser(a, "Artist")),
      ...suppliers.map((s: any) => mapUser(s, "Supplier")),
      ...doctors.map((d: any) => mapUser(d, "Doctor")),
      ...babysitters.map((b: any) => mapUser(b, "Babysitter")),
    ]);

    // Final merge sort
    unifiedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Res.ok({
      message: "Unified users fetched successfully",
      data: unifiedUsers,
    });
  } catch (error) {
    console.error("Fetch unified users error:", error);
    return Res.serverError({ message: "Failed to fetch users directory" });
  }
}
