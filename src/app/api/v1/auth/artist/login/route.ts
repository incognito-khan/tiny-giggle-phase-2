import { createMessage } from "@/actions/messages";
import { sendEmail } from "@/actions/send-email";
import { Res } from "@/lib/general-response";
import { compareHashing } from "@/lib/helpers/hash";
import { formatZodErrors } from "@/lib/helpers/zodErrorFormat";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/login";
import { createAccessToken } from "@/lib/tokens";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password, browser, location, os, time } = await req.json();
    const result = loginSchema.safeParse({ email, password });
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

    const existingUser = await prisma.artist.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && !existingUser.isDeleted) {
      const isMatch = await compareHashing(password, existingUser.password);
      if (!isMatch) {
        return Res.notFound({ message: "Invalid email or password" });
      }

      const accessToken = await createAccessToken(existingUser);
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
        role: 'artist'
      });


      return Res.ok({
        message: "Successfully logged in",
        data: {
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            categoryId: existingUser.categoryId,
            subCategoryId: existingUser.subCategoryId,
            role: 'artist'
          },
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
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}
