import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { ApiResponse } from "./types";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

console.log(ACCESS_TOKEN_SECRET, 'access token secret')

type TokenPayload = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// 🔐 Create JWT Access Token
export async function createAccessToken(user: any): Promise<string> {
  const payload: TokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.TOKEN_EXPIRY_DAYS!)
    .setJti(randomUUID())
    .sign(new TextEncoder().encode(ACCESS_TOKEN_SECRET));

  return accessToken;
}

// ✅ Verify Access Token (raw token string)
export async function verifyAccessToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(ACCESS_TOKEN_SECRET)
    );
    return verified.payload as TokenPayload;
  } catch (error) {
    return null;
  }
}

// ✅ Extract and verify token from request
export async function verifyAccessTokenFromRequest(
  req: NextRequest
): Promise<ApiResponse> {
  try {
    let token: string | undefined;

    // 1. Try from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    console.log(authHeader, token, 'authHeader, token')

    // 2. Else fallback to cookie
    if (!token) {
      token = req.cookies.get("access_token")?.value;
    }

    if (!token) {
      return { success: false, message: "Token is missing" };
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return { success: false, message: "Token is invalid or expired" };
    }

    return {
      success: true,
      message: "Token verified successfully",
      data: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    };
  } catch (error) {
    return { success: false, message: "Error while extracting token" };
  }
}
