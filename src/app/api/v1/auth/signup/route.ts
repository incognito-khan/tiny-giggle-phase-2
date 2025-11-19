import { sendEmail } from "@/actions/send-email";
import { Res } from "@/lib/general-response";
import { hashing } from "@/lib/helpers/hash";
import { generateOtp } from "@/lib/helpers/otp-generator";
import { formatZodErrors } from "@/lib/helpers/zodErrorFormat";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas/signup";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

async function handleOtpFlow({
  parentId,
  email,
  name,
}: {
  parentId: string;
  email: string;
  name: string;
}) {
  const otp = generateOtp({ length: 6 });
  const hashedOTP = await hashing(otp.code);

  await sendEmail(email, "signup-otp", {
    name,
    otp: otp.code,
    expiresIn: otp.expiresIn,
  });

  await prisma.parentOTP.create({
    data: {
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      type: "SIGNUP",
      parentId,
    },
  });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { name, email, password, type } = await req.json();

    const result = signupSchema.safeParse({ name, email, password, type });
    if (!result.success) {
      const errors = formatZodErrors(result.error.format());
      return Res.badRequest({ message: "Validation failed", errors });
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


    const existingParent = await prisma.parent.findUnique({ where: { email } });

    if (existingParent) {
      if (existingParent.isVerified) {
        return Res.badRequest({ message: "Email already exists" });
      }

      // Remove any old OTP
      await prisma.parentOTP.deleteMany({
        where: { parentId: existingParent.id, type: "SIGNUP" },
      });

      await handleOtpFlow({
        parentId: existingParent.id,
        email,
        name,
      });

      return Res.created({
        message: "An OTP has been sent to the given email",
      });
    }

    const hashedPassword = await hashing(password);

    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type,
        isDeleted: false
      },
    });

    await handleOtpFlow({
      parentId: parent.id,
      email,
      name,
    });

    return Res.created({ message: "An OTP has been sent to the given email" });
  } catch (error) {
    console.error("Signup Error:", error);
    return Res.serverError({ message: JSON.stringify(error) });
  }
}
