import z from "zod";

export const childSchema = z.object({
  name: z.email().min(1, "name is required"),
  avatar: z.string().optional(),
  type: z.enum(["BOY", "GIRL"]),
  birthday: z.string().min(1, "Birthday date is required"),
  height: z.coerce.number().min(1, "Height is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
});
