import { NextResponse } from "next/server";
import { ApiResponse } from "./types";

interface ResponseOptions {
  message: string;
  data?: any;
  url?: any;
  errors?: any;
  status?: number;
}

const buildResponse = ({
  success,
  message,
  data,
  url,
  errors,
  status,
}: ResponseOptions & { success: boolean }) => {
  return NextResponse.json<ApiResponse>(
    {
      success,
      message,
      ...(data && { data }),
      ...(url && { url }),
      ...(errors && { errors }),
    },
    { status: status ?? (success ? 200 : 500) }
  );
};

export const Res = {
  success: (opts: ResponseOptions) => buildResponse({ ...opts, success: true }),

  error: (opts: ResponseOptions) => buildResponse({ ...opts, success: false }),

  // Helpers for specific codes with optional options
  ok: (opts?: Partial<Omit<ResponseOptions, "status">>) =>
    buildResponse({
      success: true,
      message: opts?.message || "Success",
      ...opts,
      status: 200,
    }),

  created: (opts?: Partial<Omit<ResponseOptions, "status">>) =>
    buildResponse({
      success: true,
      message: opts?.message || "Created",
      ...opts,
      status: 201,
    }),

  badRequest: (opts?: Partial<Omit<ResponseOptions, "status">>) =>
    buildResponse({
      success: false,
      message: opts?.message || "Bad request",
      ...opts,
      status: 400,
    }),

  unauthorized: (opts?: Partial<Omit<ResponseOptions, "status">>) =>
    buildResponse({
      success: false,
      message: opts?.message || "Unauthorized",
      ...opts,
      status: 401,
    }),

  forbidden: (opts?: Partial<Omit<ResponseOptions, "status">>) =>
    buildResponse({
      success: false,
      message: opts?.message || "Forbidden",
      ...opts,
      status: 403,
    }),

  notFound: (opts?: Partial<Omit<ResponseOptions, "status">>) =>
    buildResponse({
      success: false,
      message: opts?.message || "Not found",
      ...opts,
      status: 404,
    }),

  serverError: (opts?: Partial<ResponseOptions>) =>
    buildResponse({
      success: false,
      message: opts?.message || "Internal server error",
      errors: opts?.errors,
      status: 500,
    }),
};
