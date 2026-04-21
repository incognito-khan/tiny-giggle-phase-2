import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED", // 👈 add this
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export async function uploadFileToS3(file: Buffer, fileType: string) {
  const fileKey = `uploads/${crypto.randomUUID()}.${fileType.split("/")[1]}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
    Body: file,
    ContentType: fileType,
  });

  await s3.send(command);

  // public URL
  const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  return fileUrl;
}

export async function getSignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 10, // 10 minutes
  });

  return url;
}

export function getPublicUrl(key: string) {
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function getPresignedUrl(key: string) {
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn: 3600 },
  );
}

/**
 * Detects if a URL is an S3 URL and returns a pre-signed URL if so.
 */
export async function signS3Url(url: string | null | undefined) {
  if (!url || typeof url !== "string" || !url.includes(".amazonaws.com/")) return url;
  try {
    const urlObj = new URL(url);
    const key = urlObj.pathname.startsWith("/")
      ? urlObj.pathname.slice(1)
      : urlObj.pathname;
    return await getPresignedUrl(key);
  } catch (err) {
    console.error("Error signing S3 URL:", err);
    return url;
  }
}

