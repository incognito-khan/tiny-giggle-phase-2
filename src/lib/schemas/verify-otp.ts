import z from "zod";

export const verifyOtpSchema = z.object({
  email: z.email().min(1, "Email is required"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
