import {
  EmailCategory,
  EmailTemplateProps,
  emailTemplates,
} from "@/lib/email-templates";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";

// 1. Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 2. Template Resolver

export async function getEmailTemplate<T extends EmailCategory>(
  category: T,
  data: EmailTemplateProps[T]
) {
  const template = emailTemplates[category];
  if (!template) throw new Error(`Template not found: ${category}`);

  const html = await render(template.component(data));
  return { subject: template.subject, html };
}

// 3. Send Email
export async function sendEmail<T extends EmailCategory>(
  to: string,
  category: T,
  data: EmailTemplateProps[T],
  from?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { subject, html } = await getEmailTemplate(category, data);
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || "noreply@yourapp.com",
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 4. Verify SMTP Connection
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
}
