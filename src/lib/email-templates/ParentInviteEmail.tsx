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

interface ParentInviteEmailProps {
  inviterName: string; // e.g., "Ali (Father)"
  inviteLink: string;
}

export const ParentInviteEmail = ({
  inviterName,
  inviteLink,
}: ParentInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>{inviterName} invited you to join Baby Journal 👶</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://cdn-icons-png.flaticon.com/512/3462/3462514.png"
            width="70"
            height="70"
            alt="Baby Journal Logo"
            style={logo}
          />
        </Section>

        <Heading style={h1}>
          You&apos;re Invited to Join Baby Journal 🎉
        </Heading>

        <Text style={text}>Hi,</Text>

        <Text style={text}>
          {inviterName} has invited you to join them on{" "}
          <strong>Baby Journal</strong> — a secure platform to stay connected
          and involved in your child’s journey.
        </Text>

        <Text style={text}>
          Click the button below to accept the invite and create your account:
        </Text>

        <Section style={ctaSection}>
          <Link href={inviteLink} style={ctaButton}>
            Accept Invite & Register
          </Link>
        </Section>

        <Text style={text}>
          If you weren&apos;t expecting this invite, you can ignore this email.
        </Text>

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

export default ParentInviteEmail;
