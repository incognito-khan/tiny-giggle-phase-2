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

    const existingUser = await prisma.parent.findUnique({
      where: {
        email,
      },
      include: {
        children: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            avatar: true,
            type: true,
          },
        },
        folders: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            type: true,
            ownerId: true,
            subfolders: {
              where: { isDeleted: false },
              select: {
                id: true,
              },
            },
            createdAt: true,
          },
        },
        carts: {
          where: { isDeleted: false },
          select: {
            items: {
              where: { isDeleted: false },
              select: {
                id: true,
                cartId: true,
                productId: true,
                quantity: true,
                price: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    salePrice: true,
                    category: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existingUser && !existingUser?.isDeleted) {
      const isMatch = await compareHashing(password, existingUser.password);
      if (!isMatch) {
        return Res.notFound({ message: "Invalid email or password" });
      }

      if (!existingUser.isVerified) {
        return Res.badRequest({
          message: "Please check your email and verify your account",
        });
      }

      const user = { ...existingUser, role: "parent" };

      const accessToken = await createAccessToken(user);
      const preparedUser = await prepareUser(existingUser, "parent");

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
        role: "parent",
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

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      const isMatch = password === existingAdmin.password;
      if (!isMatch) {
        return Res.notFound({ message: "Invalid email or password" });
      }

      const accessToken = await createAccessToken(existingAdmin);
      const preparedUser = await prepareUser(existingAdmin, "admin");

      await sendEmail(existingAdmin.email, "new-login-detected", {
        name: existingAdmin.name,
        browser,
        location,
        os,
        time,
      });

      await createMessage({
        title: "New Login Detected",
        parentId: existingAdmin.id,
        role: "admin",
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

    if ((!existingUser || existingUser.isDeleted) && !existingAdmin) {
      return Res.notFound({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Res.serverError({ message });
  }
}
