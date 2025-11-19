import z from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be atleast 8 characters"),
  type: z.enum(["FATHER", "MOTHER"]),
});
