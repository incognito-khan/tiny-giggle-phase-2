import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/helpers/s3";
import { Res } from "@/lib/general-response";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Res.badRequest({ message: "File is required" });
    }

    // Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Res.badRequest({ message: "Invalid file type. Only PDF, JPG, and PNG are allowed." });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Res.badRequest({ message: "File is too large. Maximum size is 5MB." });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFileToS3(buffer, file.type);

    return Res.ok({ message: "File uploaded successfully", data: { url: fileUrl } });
  } catch (error) {
    console.error("Public Upload error:", error);
    return Res.serverError();
  }
}
