import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { getPresignedUrl } from "@/lib/helpers/s3";

async function signUrl(picture: string | null | undefined) {
  if (!picture || !picture.startsWith("http")) return picture;
  try {
    const url = new URL(picture);
    const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    return await getPresignedUrl(key);
  } catch (err) {
    return picture;
  }
}

// GET /api/v1/appointments
// List appointments for the current user
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAccessTokenFromRequest(req);
    if (!authResult.success) {
      return Res.unauthorized({ message: authResult.message });
    }

    const { id: userId, role } = authResult.data;

    const where: any = {};
    if (role === 'doctor') where.doctorId = userId;
    else if (role === 'babysitter') where.babysitterId = userId;
    else if (role === 'parent' || role === 'relative') where.parentId = userId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
            select: { name: true, specialty: true, profilePicture: true }
        },
        babysitter: {
            select: { name: true, profilePictureUrl: true }
        },
        parent: {
            select: { name: true, email: true, profilePicture: true }
        },
        child: {
            select: { id: true, name: true, avatar: true, type: true, birthday: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sign profile pictures
    const processedAppointments = await Promise.all(appointments.map(async (app) => {
      const processed = { ...app };
      if (processed.doctor) {
        processed.doctor.profilePicture = await signUrl(processed.doctor.profilePicture);
      }
      if (processed.babysitter) {
        processed.babysitter.profilePictureUrl = await signUrl(processed.babysitter.profilePictureUrl);
      }
      if (processed.parent) {
        processed.parent.profilePicture = await signUrl(processed.parent.profilePicture);
      }
      return processed;
    }));

    return Res.ok({ data: processedAppointments, message: "Appointments fetched successfully" });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    return Res.serverError();
  }
}

// POST /api/v1/appointments
// Create a new booking
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAccessTokenFromRequest(req);
    if (!authResult.success) {
      return Res.unauthorized({ message: authResult.message });
    }

    const { id: parentId } = authResult.data;
    const body = await req.json();
    const { doctorId, babysitterId, childId, appointmentDate, notes } = body;

    if (!appointmentDate || (!doctorId && !babysitterId)) {
      return Res.badRequest({ message: "Missing required fields" });
    }

    // Get Professional details for fee and payment method
    let fee = 0;
    let paymentMethod = "SELF";

    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) return Res.notFound({ message: "Doctor not found" });
      fee = doctor.consultationFee;
      paymentMethod = doctor.paymentCollectionMethod;
    } else {
      const sitter = await prisma.babysitter.findUnique({ where: { id: babysitterId } });
      if (!sitter) return Res.notFound({ message: "Babysitter not found" });
      fee = sitter.hourlyRate || 0; 
      paymentMethod = sitter.paymentCollectionMethod;
    }

    const appointment = await prisma.appointment.create({
      data: {
        parentId,
        doctorId,
        babysitterId,
        childId,
        appointmentDate: new Date(appointmentDate),
        consultationFee: fee,
        paymentMethod: paymentMethod as any,
        notes,
        status: "PENDING",
        // If it's self pay, it's effectively "Paid" for the system's workflow purposes 
        // until we add manual confirmation, or we just leave it PENDING.
        paymentStatus: "PENDING" 
      }
    });

    return Res.created({ 
      message: "Appointment booked successfully", 
      data: appointment 
    });

  } catch (error) {
    console.error("Create appointment error:", error);
    return Res.serverError();
  }
}
