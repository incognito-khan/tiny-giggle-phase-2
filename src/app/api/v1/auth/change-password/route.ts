import { sendEmail } from "@/actions/send-email";
import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { hashing } from "@/lib/helpers/hash";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password || !role) {
      return Res.badRequest({ message: "All fields are required" });
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

    if (role === 'supplier') {
      const existingUser = await prisma.supplier.findUnique({
        where: { email },
      });
      if (!existingUser) {
        return Res.unauthorized({ message: "No account found" });
      }
      const verifiedOtp = await prisma.supplierOTP.findFirst({
        where: {
          type: "PASSWORD_RESET",
          supplier: {
            email,
          },
        },
      });
      if (!verifiedOtp) {
        return Res.unauthorized({
          message: "You are not allowed to change password",
        });
      }
      await prisma.supplierOTP.delete({ where: { id: verifiedOtp.id } });

      const hashedPassword = await hashing(password);

      await prisma.supplier.update({
        where: { email },
        data: { password: hashedPassword }
      })

      // Email already updated in another flow
      await sendEmail(existingUser.email, "password-changed-success", {
        name: existingUser.name,
      });
      return Res.ok({ message: "Your password has been reset" });
    }

    if (role === 'artist') {
      const existingUser = await prisma.artist.findUnique({
        where: { email },
      });
      if (!existingUser) {
        return Res.unauthorized({ message: "No account found" });
      }
      const verifiedOtp = await prisma.artistOTP.findFirst({
        where: {
          type: "PASSWORD_RESET",
          artist: {
            email,
          },
        },
      });
      if (!verifiedOtp) {
        return Res.unauthorized({
          message: "You are not allowed to change password",
        });
      }
      await prisma.artistOTP.delete({ where: { id: verifiedOtp.id } });

      const hashedPassword = await hashing(password);

      await prisma.artist.update({
        where: { email },
        data: { password: hashedPassword }
      })

      // Email already updated in another flow
      await sendEmail(existingUser.email, "password-changed-success", {
        name: existingUser.name,
      });
      return Res.ok({ message: "Your password has been reset" });
    }

    if (role === 'parent') {
      const existingUser = await prisma.parent.findUnique({
        where: { email },
      });
      if (!existingUser) {
        return Res.unauthorized({ message: "No account found" });
      }
      const verifiedOtp = await prisma.parentOTP.findFirst({
        where: {
          type: "PASSWORD_RESET",
          parent: {
            email,
          },
        },
      });
      if (!verifiedOtp) {
        return Res.unauthorized({
          message: "You are not allowed to change password",
        });
      }
      await prisma.parentOTP.delete({ where: { id: verifiedOtp.id } });

      const hashedPassword = await hashing(password);

      await prisma.parent.update({
        where: { email },
        data: { password: hashedPassword }
      })

      // Email already updated in another flow
      await sendEmail(existingUser.email, "password-changed-success", {
        name: existingUser.name,
      });
      return Res.ok({ message: "Your password has been reset" });
    }

    if (role === 'relative') {
      const existingUser = await prisma.childRelation.findUnique({
        where: { email },
      });
      if (!existingUser) {
        return Res.unauthorized({ message: "No account found" });
      }
      const verifiedOtp = await prisma.relativeOTP.findFirst({
        where: {
          type: "PASSWORD_RESET",
          relative: {
            email,
          },
        },
      });
      if (!verifiedOtp) {
        return Res.unauthorized({
          message: "You are not allowed to change password",
        });
      }
      await prisma.relativeOTP.delete({ where: { id: verifiedOtp.id } });

      const hashedPassword = await hashing(password);

      await prisma.childRelation.update({
        where: { email },
        data: { password: hashedPassword }
      })

      // Email already updated in another flow
      await sendEmail(existingUser.email, "password-changed-success", {
        name: existingUser.name,
      });
      return Res.ok({ message: "Your password has been reset" });
    }

  } catch (error) {
    return Res.serverError();
  }
}
