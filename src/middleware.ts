import { NextRequest, NextResponse } from "next/server";
import { verifyAccessTokenFromRequest } from "./lib/tokens";
import { Res } from "./lib/general-response";

const protectedRoutes = [
  "/api/v1/parents",
  "/api/v1/parents/",
  "/api/v1/parents/**",
  "/api/v1/products",
  "/api/v1/products/",
  "/api/v1/products/**",
];

const authRoutes = [
  "/api/v1/auth/login",
  "/api/v1/auth/signup",
  "/api/v1/auth/forgot-password",
];

const publicRoutes = [
  "/accept-invitation", // frontend page
  "/accept-invitation/**", // allow /accept-invitation/:id
  "/api/v1/parents/**/accept-invitation", // allow API route with any :id
];

export async function middleware(req: NextRequest) {
  console.log("middleware called");

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  const path = req.nextUrl.pathname;

  // Public route check (no token needed)
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("**")) {
      const baseRoute = route.replace("/**", "");
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // const isProtectedRoute = protectedRoutes.includes(path);
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.endsWith("/**")) {
      const baseRoute = route.replace("/**", "");
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
  const isAuthRoute = authRoutes.includes(path);
  console.log(path, isProtectedRoute);
  const { success, message } = await verifyAccessTokenFromRequest(req);

  if (isProtectedRoute && !success) {
    return Res.unauthorized({ message: "Token is missing or invalid" });
    // return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthRoute && success) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
