import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/helpers/s3";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audio = formData.get("audio") as File;

        if (!audio) {
            return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
        }

        // File ko buffer me convert karo
        const buffer = Buffer.from(await audio.arrayBuffer());

        // File URL generate karo (S3 helper ko type bhej rahe hain)
        const fileUrl = await uploadFileToS3(buffer, audio.type);

        return NextResponse.json({
            message: "Audio uploaded successfully",
            data: {
                url: fileUrl,
                mimeType: audio.type,
                size: audio.size,
            }
        });
    } catch (error) {
        console.error("Audio upload error:", error);
        return NextResponse.json({ error: "Audio upload failed" }, { status: 500 });
    }
}
