import {
  Html, Head, Body, Container, Section, Text,
  Heading, Hr, Button, Preview,
} from "@react-email/components";
import { format } from "date-fns";

interface ExpiryAlertEmailProps {
  clientName: string;
  serviceName: string;
  expiryDate: Date;
  daysLeft: number;
}

export function ExpiryAlertEmail({
  clientName,
  serviceName,
  expiryDate,
  daysLeft,
}: ExpiryAlertEmailProps) {
  const urgencyColor = daysLeft <= 1 ? "#ef4444" : "#f59e0b";
  const urgencyText =
    daysLeft === 0
      ? "expires TODAY"
      : daysLeft === 1
      ? "expires TOMORROW"
      : `expires in ${daysLeft} days`;

  return (
    <Html>
      <Head />
      <Preview>
        ⚠️ Your {serviceName} subscription {urgencyText}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>SubTrack</Text>
          </Section>

          {/* Alert banner */}
          <Section style={{ ...alertBanner, borderColor: urgencyColor }}>
            <Text style={{ ...alertText, color: urgencyColor }}>
              ⚠️ Subscription Expiring
            </Text>
          </Section>

          {/* Main content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Hi {clientName},</Heading>
            <Text style={textStyle}>
              Your <strong>{serviceName}</strong> subscription{" "}
              <strong style={{ color: urgencyColor }}>{urgencyText}</strong>.
            </Text>
            <Text style={textStyle}>
              Expiry date:{" "}
              <strong>{format(new Date(expiryDate), "MMMM d, yyyy")}</strong>
            </Text>

            <Section style={boxStyle}>
              <Text style={boxTextStyle}>
                📦 Service: <strong>{serviceName}</strong>
              </Text>
              <Text style={boxTextStyle}>
                📅 Expires: <strong>{format(new Date(expiryDate), "dd MMM yyyy")}</strong>
              </Text>
              <Text style={boxTextStyle}>
                ⏰ Time left:{" "}
                <strong style={{ color: urgencyColor }}>
                  {daysLeft === 0 ? "Today!" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
                </strong>
              </Text>
            </Section>

            <Text style={textStyle}>
              Please contact your provider to renew your subscription and avoid
              any service interruption.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              This is an automated reminder from SubTrack.
              <br />
              If you have questions, reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle = {
  backgroundColor: "#0d1117",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: "0",
  padding: "20px 0",
};
const containerStyle = {
  backgroundColor: "#161b22",
  border: "1px solid #30363d",
  borderRadius: "12px",
  maxWidth: "520px",
  margin: "0 auto",
  overflow: "hidden",
};
const headerStyle = {
  backgroundColor: "#1c2128",
  padding: "20px 32px",
  borderBottom: "1px solid #30363d",
};
const logoStyle = {
  color: "#58a6ff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};
const alertBanner = {
  borderLeft: "4px solid",
  margin: "24px 32px 0",
  paddingLeft: "16px",
};
const alertText = {
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};
const contentStyle = { padding: "16px 32px 24px" };
const headingStyle = {
  color: "#e6edf3",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 12px",
};
const textStyle = {
  color: "#8b949e",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};
const boxStyle = {
  backgroundColor: "#1c2128",
  border: "1px solid #30363d",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};
const boxTextStyle = {
  color: "#c9d1d9",
  fontSize: "14px",
  margin: "0 0 8px",
};
const hrStyle = { borderColor: "#30363d", margin: "0" };
const footerStyle = { padding: "20px 32px" };
const footerTextStyle = {
  color: "#484f58",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};
