import z from "zod";

export function formatZodErrors(
  errors: z.ZodFormattedError<any, string>
): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const key in errors) {
    const field = errors[key];
    if ("_errors" in field && field._errors.length > 0) {
      formatted[key] = field._errors[0]; // Only return the first error
    }
  }
  return formatted;
}
