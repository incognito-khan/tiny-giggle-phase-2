import { createMessage } from "@/actions/messages";
import { sendEmail } from "@/actions/send-email";
import { Res } from "@/lib/general-response";
import { compareHashing } from "@/lib/helpers/hash";
import { formatZodErrors } from "@/lib/helpers/zodErrorFormat";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/login";
import { createAccessToken } from "@/lib/tokens";
import { prepareUser } from "@/lib/prepare-user";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password, browser, location, os, time } = await req.json();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors = formatZodErrors(result.error.format());
      return Res.badRequest({ message: "Validation failed", errors });
    }

    const existingUser = await prisma.doctor.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && !existingUser.isDeleted) {
      const isMatch = await compareHashing(password, existingUser.password);
      if (!isMatch) {
        return Res.notFound({ message: "Invalid email or password" });
      }

      const user = { ...existingUser, role: "doctor" };

      const accessToken = await createAccessToken(user);
      const preparedUser = await prepareUser(user, "doctor");

      await sendEmail(existingUser.email, "new-login-detected", {
        name: existingUser.name,
        browser,
        location,
        os,
        time,
      });

      await createMessage({
        title: "New Login Detected",
        parentId: existingUser.id,
        role: "doctor",
      });

      return Res.ok({
        message: "Successfully logged in",
        data: {
          user: preparedUser,
          tokens: {
            accessToken,
          },
        },
      });
    }

    if (!existingUser || existingUser.isDeleted) {
      return Res.notFound({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}
