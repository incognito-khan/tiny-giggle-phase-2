import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetOtpEmailProps {
  name: string;
  otp: string;
  expiresIn: string;
}

export const PasswordResetOtpEmail = ({
  name,
  otp,
  expiresIn,
}: PasswordResetOtpEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset Your Baby Journal Password 🔐</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://cdn-icons-png.flaticon.com/512/3462/3462514.png"
            width="80"
            height="80"
            alt="Baby Journal Logo"
            style={logo}
          />
        </Section>

        <Heading style={h1}>Reset Your Password 🔐</Heading>

        <Text style={text}>Hi {name},</Text>

        <Text style={text}>
          We received a request to reset your Baby Journal account password. Use
          the verification code below to proceed:
        </Text>

        <Section style={otpContainer}>
          <Text style={otpCode}>{otp}</Text>
        </Section>

        <Text style={text}>
          ⏳ This code will expire in <strong>{expiresIn}</strong>. If you
          didn’t request this, you can safely ignore this message.
        </Text>

        <Text style={text}>
          🔒 For security reasons, never share this code with anyone.
        </Text>

        <Section style={footer}>
          <Text style={footerText}>
            Need help?{" "}
            <Link href="mailto:support@babyjournal.com" style={link}>
              Contact our support team
            </Link>
          </Text>
          <Text style={footerText}>
            🍼 © 2024 Baby Journal. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// ===== Styles =====

const main = {
  backgroundColor: "#FFF0F5",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "520px",
  borderRadius: "12px",
  boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
};

const logoContainer = {
  margin: "24px 0 8px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#FF69B4",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 8px",
  textAlign: "left" as const,
};

const otpContainer = {
  background: "#FFE4EC",
  borderRadius: "10px",
  margin: "32px auto",
  padding: "20px 32px",
  textAlign: "center" as const,
  width: "fit-content",
};

const otpCode = {
  color: "#D63384",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "10px",
  margin: "0",
  fontFamily: "monospace",
};

const footer = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#999",
  fontSize: "13px",
  lineHeight: "18px",
  margin: "4px 0",
};

const link = {
  color: "#FF69B4",
  textDecoration: "underline",
};

export default PasswordResetOtpEmail;
