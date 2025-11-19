"use server";

import { sendEmail } from "@/actions/send-email";
import { hashing } from "@/lib/helpers/hash";
import { generateOtp } from "@/lib/helpers/otp-generator";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function acceptInvitation({
  name,
  email,
  password,
  parentId,
}: any): Promise<ApiResponse> {
  try {
    if (!name || !email || !password || !parentId) {
      return { success: false, message: "All fields are required" };
    }
    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: {
        type: true,
        email: true,
        childIds: true,
      },
    });
    if (!existingParent) {
      return { success: false, message: "Invalid ID provided" };
    }
    if (existingParent.email === email) {
      return { success: false, message: "This email already exists" };
    }
    const firstChildId = existingParent?.childIds?.[0]; // 👈 Get first child ID
    if (!firstChildId) {
      return {
        success: false,
        message: "No child found, please create child first",
      };
    }
    const type = existingParent.type === "FATHER" ? "MOTHER" : "FATHER";
    const hashedPassword = await hashing(password);
    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type,
      },
    });

    await prisma.child.update({
      where: { id: firstChildId },
      data: {
        parentIds: {
          push: parent.id,
        },
      },
    });

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
        parentId: parent.id,
      },
    });
    return {
      success: true,
      message: "An OTP has been sent to the given email",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error" };
  }
}
