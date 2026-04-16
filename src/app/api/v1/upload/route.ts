import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/helpers/s3";
import { Res } from "@/lib/general-response";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  try {
    const { success, message } = await verifyAccessTokenFromRequest(req);
    if (!success) {
      return Res.unauthorized({ message });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Res.badRequest({ message: "File is required" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFileToS3(buffer, file.type);

    return Res.ok({ message: "File uploaded successfully", data: { url: fileUrl } });
  } catch (error) {
    console.error("Upload error:", error);
    return Res.serverError();
  }
}
