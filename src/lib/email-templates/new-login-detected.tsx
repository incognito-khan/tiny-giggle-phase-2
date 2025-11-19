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

interface NewLoginDetectedEmailProps {
  name: string;
  location: string;
  time: string;
  browser: string;
  os: string;
}

export const NewLoginDetectedEmail = ({
  name,
  location,
  time,
  browser,
  os,
}: NewLoginDetectedEmailProps) => (
  <Html>
    <Head />
    <Preview>New login detected on your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://cdn-icons-png.flaticon.com/512/595/595067.png"
            width="64"
            height="64"
            alt="Security Icon"
            style={logo}
          />
        </Section>

        <Heading style={h1}>New Login Detected 👀</Heading>

        <Text style={text}>Hi {name},</Text>

        <Text style={text}>
          A new login to your Baby Journal account was detected with the
          following details:
        </Text>

        <Text style={infoText}>
          📍 <strong>Location:</strong> {location} <br />
          🕒 <strong>Time:</strong> {time} <br />
          🌐 <strong>Browser:</strong> {browser} <br />
          💻 <strong>Operating System:</strong> {os}
        </Text>

        <Text style={text}>
          If this was you, no action is needed. If you don’t recognize this
          activity, we recommend you reset your password immediately.
        </Text>

        <Section style={ctaSection}>
          <Link href="https://yourapp.com/change-password" style={ctaButton}>
            Reset Password
          </Link>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Need help?{" "}
            <Link href="mailto:support@babyjournal.com" style={link}>
              Contact Support
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
  backgroundColor: "#F9F9FF",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "520px",
  borderRadius: "12px",
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
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
  fontSize: "22px",
  fontWeight: "bold",
  margin: "16px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 8px",
  textAlign: "left" as const,
};

const infoText = {
  ...text,
  backgroundColor: "#FFF0F5",
  padding: "12px",
  borderRadius: "8px",
  fontFamily: "monospace",
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const ctaButton = {
  backgroundColor: "#FF69B4",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};

const footer = {
  marginTop: "48px",
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

export default NewLoginDetectedEmail;
