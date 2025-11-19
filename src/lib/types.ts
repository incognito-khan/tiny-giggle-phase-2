import z from "zod";

export type ApiResponse<T = any> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; errors?: Record<string, string> };
