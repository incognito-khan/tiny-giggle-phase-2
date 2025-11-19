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

  // Optional helpers for specific codes
  ok: (opts: Omit<ResponseOptions, "status">) =>
    buildResponse({ ...opts, success: true, status: 200 }),

  created: (opts: Omit<ResponseOptions, "status">) =>
    buildResponse({ ...opts, success: true, status: 201 }),

  badRequest: (opts: Omit<ResponseOptions, "status">) =>
    buildResponse({ ...opts, success: false, status: 400 }),

  unauthorized: (opts: Omit<ResponseOptions, "status">) =>
    buildResponse({ ...opts, success: false, status: 401 }),

  notFound: (opts: Omit<ResponseOptions, "status">) =>
    buildResponse({ ...opts, success: false, status: 404 }),

  serverError: (opts?: Partial<ResponseOptions>) =>
    buildResponse({
      success: false,
      message: opts?.message || "Internal server error",
      errors: opts?.errors,
      status: 500,
    }),
};
