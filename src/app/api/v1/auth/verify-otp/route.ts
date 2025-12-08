import { sendEmail } from "@/actions/send-email";
import { Res } from "@/lib/general-response";
import { compareHashing } from "@/lib/helpers/hash";
import { formatZodErrors } from "@/lib/helpers/zodErrorFormat";
import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/schemas/verify-otp";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, otp, type, role } = await req.json();

    const validType = type === "SIGNUP" || type === "PASSWORD_RESET";

    // Validate the input
    const result = verifyOtpSchema.safeParse({ email, otp });
    if (!result.success) {
      const errors = formatZodErrors(result.error.format());
      return Res.badRequest({ message: "Validation failed", errors });
    }

    if (!validType) {
      return Res.badRequest({ message: "Invalid verification type" });
    }

    // if (!captcha) {
    //   return Res.badRequest({ message: "Captcha verification failed" });
    // }

    // const verifyRes = await fetch(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
    //   { method: "POST" }
    // );

    // const verifyData = await verifyRes.json();

    // if (!verifyData.success) {
    //   return Res.badRequest({ message: "Captcha verification failed" });
    // }

    if (role === 'supplier' && type === 'PASSWORD_RESET') {
      const supplier = await prisma.supplier.findUnique({ where: { email } });
      if (!supplier) {
        return Res.notFound({ message: "Supplier not found" });
      }

      const otpRecord = await prisma.supplierOTP.findFirst({
        where: { supplierId: supplier.id, type },
      });

      if (!otpRecord) {
        return Res.notFound({ message: "OTP not found or already used" });
      }

      if (otpRecord.expiresAt < new Date()) {
        await prisma.supplierOTP.delete({ where: { id: otpRecord.id } }); // optional cleanup
        return Res.badRequest({ message: "OTP has expired" });
      }

      const isMatch = await compareHashing(otp, otpRecord.otp);
      if (!isMatch) {
        return Res.badRequest({ message: "Invalid OTP" });
      }

      await prisma.supplierOTP.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
        },
      });

      return Res.ok({ message: "Password reset verified successfully" });
    }

    if (role === 'artist' && type === 'PASSWORD_RESET') {
      const artist = await prisma.artist.findUnique({ where: { email } });
      if (!artist) {
        return Res.notFound({ message: "Artist not found" });
      }

      const otpRecord = await prisma.artistOTP.findFirst({
        where: { artistId: artist.id, type },
      });

      if (!otpRecord) {
        return Res.notFound({ message: "OTP not found or already used" });
      }

      if (otpRecord.expiresAt < new Date()) {
        await prisma.artistOTP.delete({ where: { id: otpRecord.id } }); // optional cleanup
        return Res.badRequest({ message: "OTP has expired" });
      }

      const isMatch = await compareHashing(otp, otpRecord.otp);
      if (!isMatch) {
        return Res.badRequest({ message: "Invalid OTP" });
      }

      await prisma.artistOTP.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
        },
      });

      return Res.ok({ message: "Password reset verified successfully" });
    }

    if (role === 'relative' && type === 'PASSWORD_RESET') {
      const relative = await prisma.childRelation.findFirst({ where: { email, isDeleted: false } });
      if (!relative) {
        return Res.notFound({ message: "User not found" });
      }

      const otpRecord = await prisma.relativeOTP.findFirst({
        where: { relativeId: relative.id, type },
      });

      if (!otpRecord) {
        return Res.notFound({ message: "OTP not found or already used" });
      }

      if (otpRecord.expiresAt < new Date()) {
        await prisma.relativeOTP.delete({ where: { id: otpRecord.id } }); // optional cleanup
        return Res.badRequest({ message: "OTP has expired" });
      }

      const isMatch = await compareHashing(otp, otpRecord.otp);
      if (!isMatch) {
        return Res.badRequest({ message: "Invalid OTP" });
      }

      await prisma.relativeOTP.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
        },
      });

      return Res.ok({ message: "Password reset verified successfully" });
    }


    const parent = await prisma.parent.findUnique({ where: { email } });
    if (!parent) {
      return Res.notFound({ message: "Parent not found" });
    }

    // Special case for SIGNUP
    if (type === "SIGNUP" && parent.isVerified) {
      await prisma.parentOTP.deleteMany({
        where: { parentId: parent.id, type: "SIGNUP" },
      });
      return Res.badRequest({ message: "Account already verified" });
    }

    const otpRecord = await prisma.parentOTP.findFirst({
      where: { parentId: parent.id, type },
    });

    if (!otpRecord) {
      return Res.notFound({ message: "OTP not found or already used" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.parentOTP.delete({ where: { id: otpRecord.id } }); // optional cleanup
      return Res.badRequest({ message: "OTP has expired" });
    }

    const isMatch = await compareHashing(otp, otpRecord.otp);
    if (!isMatch) {
      return Res.badRequest({ message: "Invalid OTP" });
    }

    // ✅ SIGNUP case
    if (type === "SIGNUP") {
      await prisma.parent.update({
        where: { id: parent.id },
        data: { isVerified: true },
      });

      await sendEmail(parent.email, "email-verified-success", {
        name: parent.name,
      });

      await prisma.parentOTP.delete({ where: { id: otpRecord.id } });

      return Res.ok({ message: "Account verified successfully" });
    }

    // ✅ PASSWORD_RESET case
    if (type === "PASSWORD_RESET") {
      await prisma.parentOTP.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
        },
      });

      return Res.ok({ message: "Password reset verified successfully" });
    }

    // Fallback
    return Res.badRequest({ message: "Unknown verification type" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return Res.serverError();
  }
}
