import crypto from "crypto";
import bcrypt from "bcryptjs";

export interface OtpConfig {
  length?: number;
  expiresInMinutes?: number;
  includeLetters?: boolean;
  includeNumbers?: boolean;
  excludeSimilar?: boolean;
}

export interface GeneratedOtp {
  code: string;
  expiresAt: Date;
  expiresIn: string;
}

const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SIMILAR_CHARS = "0O1Il";

export function generateOtp(config: OtpConfig = {}): GeneratedOtp {
  const {
    length = 6,
    expiresInMinutes = parseInt(process.env.EMAIL_OTP_TIME_IN_MINUTES!),
    includeLetters = false,
    includeNumbers = true,
    excludeSimilar = true,
  } = config;

  let charset = "";

  if (includeNumbers) {
    charset += NUMBERS;
  }

  if (includeLetters) {
    charset += LETTERS;
  }

  if (excludeSimilar) {
    charset = charset
      .split("")
      .filter((char) => !SIMILAR_CHARS.includes(char))
      .join("");
  }

  if (!charset) {
    throw new Error("Invalid OTP configuration: no valid characters available");
  }

  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    otp += charset[randomIndex];
  }

  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  const expiresIn = `${expiresInMinutes} minute${
    expiresInMinutes !== 1 ? "s" : ""
  }`;

  return {
    code: otp,
    expiresAt,
    expiresIn,
  };
}

export async function verifyOtp(
  otp: string,
  storedOtp: string,
  expiresAt: Date
): Promise<boolean> {
  if (new Date() > expiresAt) {
    return false;
  }
  return await bcrypt.compare(otp, storedOtp);
}
