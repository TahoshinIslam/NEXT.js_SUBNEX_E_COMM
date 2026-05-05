import {
  Html, Head, Body, Container, Section, Text,
  Heading, Hr, Preview,
} from "@react-email/components";
import { format } from "date-fns";

interface RenewalConfirmEmailProps {
  clientName: string;
  serviceName: string;
  newExpiryDate: Date;
}

export function RenewalConfirmEmail({
  clientName,
  serviceName,
  newExpiryDate,
}: RenewalConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>✅ Your {serviceName} subscription has been renewed</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={logoStyle}>SubTrack</Text>
          </Section>

          <Section style={successBanner}>
            <Text style={successText}>✅ Renewal Confirmed</Text>
          </Section>

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Great news, {clientName}!</Heading>
            <Text style={textStyle}>
              Your <strong>{serviceName}</strong> subscription has been
              successfully renewed.
            </Text>

            <Section style={boxStyle}>
              <Text style={boxTextStyle}>
                📦 Service: <strong>{serviceName}</strong>
              </Text>
              <Text style={boxTextStyle}>
                ✅ Status: <strong style={{ color: "#3fb950" }}>Active</strong>
              </Text>
              <Text style={{ ...boxTextStyle, margin: "0" }}>
                📅 Valid until:{" "}
                <strong style={{ color: "#58a6ff" }}>
                  {format(new Date(newExpiryDate), "MMMM d, yyyy")}
                </strong>
              </Text>
            </Section>

            <Text style={textStyle}>
              Enjoy uninterrupted access to your subscription. We'll remind you
              before it expires again.
            </Text>
          </Section>

          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              This confirmation was sent by SubTrack.
              <br />
              Contact your provider if you have any questions.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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
const successBanner = {
  borderLeft: "4px solid #3fb950",
  margin: "24px 32px 0",
  paddingLeft: "16px",
};
const successText = {
  color: "#3fb950",
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
