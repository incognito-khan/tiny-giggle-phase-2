import SignupOtpEmail from "./otpEmail";
import PasswordResetOtpEmail from "./PasswordResetOtpEmail";
import EmailVerifiedSuccess from "./EmailVerifiedSuccess";
import PasswordResetSuccessEmail from "./PasswordResetSuccess";
import NewLoginDetectedEmail from "./new-login-detected";
import ParentInviteEmail from "./ParentInviteEmail";
import NewAccountEmail from "./NewAccountEmail";
import { RelationAccountEmail } from "./createRelation";

export interface EmailTemplateProps {
  "signup-otp": {
    name: string;
    otp: string;
    expiresIn: string;
  };
  "password-reset-otp": any;
  "email-verified-success": {
    name: string;
  };
  "password-changed-success": {
    name: string;
  };
  "new-login-detected": {
    name: string;
    location: string;
    time: string;
    browser: string;
    os: string;
  };
  "invite-parent": {
    inviterName: string;
    inviteLink: string;
  };
  "new-vendor-account": {
    name: string;
    email: string;
    password: string;
    role: "Artist" | "Supplier"
  };
  "new-relative-account": {
    inviterName: string;
    relativeName: string;
    email: string;
    password: string;
    loginLink: string;
    relation: string;
  }
}

export const emailTemplates = {
  "signup-otp": {
    subject: "Verify Your Account - OTP Code",
    component: SignupOtpEmail,
  },
  "password-reset-otp": {
    subject: "Reset Your Password - OTP Code",
    component: PasswordResetOtpEmail,
  },
  "email-verified-success": {
    subject: "Your Email Has Been Verified",
    component: EmailVerifiedSuccess,
  },
  "password-changed-success": {
    subject: "Your Password Has Been Changed",
    component: PasswordResetSuccessEmail,
  },
  "new-login-detected": {
    subject: "New Login Detected",
    component: NewLoginDetectedEmail,
  },
  "invite-parent": {
    subject: "You have been Invited",
    component: ParentInviteEmail,
  },
  "new-vendor-account": {
    subject: "Your account has been created",
    component: NewAccountEmail,
  },
  "new-relative-account": {
    subject: "Your account has been created",
    component: RelationAccountEmail,
  }
} as const;

export type EmailCategory = keyof typeof emailTemplates;
