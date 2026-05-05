import {
  Html, Head, Body, Container, Section,
  Text, Heading, Hr, Preview,
} from "@react-email/components";

interface OrderConfirmEmailProps {
  customerName: string;
  orderNumber: string;
  items: Array<{ serviceName: string; duration: number; quantity: number; price: number }>;
  totalAmount: number;
  paymentMethod: string;
  portalUrl: string;
}

export function OrderConfirmEmail({
  customerName,
  orderNumber,
  items,
  totalAmount,
  paymentMethod,
  portalUrl,
}: OrderConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>✅ Order {orderNumber} confirmed — SubTrack</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>SubTrack Store</Text>
          </Section>

          <Section style={{ borderLeft: "4px solid #3fb950", margin: "24px 32px 0", paddingLeft: "16px" }}>
            <Text style={{ color: "#3fb950", fontSize: "13px", fontWeight: "600", margin: "0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ✅ Order Confirmed
            </Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Thanks, {customerName}!</Heading>
            <Text style={text}>
              Your order <strong style={{ color: "#58a6ff" }}>{orderNumber}</strong> has been received.
              We'll process it and deliver your credentials within 24 hours.
            </Text>

            {/* Items */}
            <Section style={box}>
              <Text style={{ ...boxLabel, marginBottom: "12px" }}>Order Items</Text>
              {items.map((item, i) => (
                <Section key={i} style={{ marginBottom: "8px" }}>
                  <Text style={{ ...boxText, margin: "0" }}>
                    📦 {item.serviceName} ({item.duration} days) × {item.quantity}
                    <span style={{ float: "right", color: "#3fb950" }}>
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </Text>
                </Section>
              ))}
              <Hr style={{ borderColor: "#30363d", margin: "12px 0" }} />
              <Text style={{ ...boxText, fontWeight: "700", margin: "0" }}>
                Total
                <span style={{ float: "right", color: "#58a6ff" }}>
                  ৳{totalAmount.toLocaleString()}
                </span>
              </Text>
            </Section>

            {/* Payment info */}
            <Section style={{ ...box, borderColor: "#1f6feb" }}>
              <Text style={boxLabel}>Payment Method: {paymentMethod}</Text>
              <Text style={{ ...text, margin: "0", fontSize: "13px" }}>
                {paymentMethod === "CASH"
                  ? "Payment will be collected on delivery."
                  : `Please send ৳${totalAmount.toLocaleString()} to our ${paymentMethod} number. Use your order number (${orderNumber}) as the reference.`}
              </Text>
            </Section>

            <Text style={text}>
              Track your order status at any time by visiting your account portal.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#30363d", margin: "0" }} />
          <Section style={{ padding: "20px 32px" }}>
            <Text style={{ color: "#484f58", fontSize: "12px", margin: "0" }}>
              This confirmation was sent by SubTrack Store.<br />
              Portal: {portalUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#0d1117", fontFamily: "-apple-system, sans-serif", margin: "0", padding: "20px 0" };
const container = { backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "12px", maxWidth: "520px", margin: "0 auto", overflow: "hidden" };
const header = { backgroundColor: "#1c2128", padding: "20px 32px", borderBottom: "1px solid #30363d" };
const logo = { color: "#58a6ff", fontSize: "20px", fontWeight: "700", margin: "0" };
const content = { padding: "16px 32px 24px" };
const heading = { color: "#e6edf3", fontSize: "22px", fontWeight: "700", margin: "0 0 12px" };
const text = { color: "#8b949e", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const box = { backgroundColor: "#1c2128", border: "1px solid #30363d", borderRadius: "8px", padding: "16px", margin: "16px 0" };
const boxLabel = { color: "#c9d1d9", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em", margin: "0 0 4px" };
const boxText = { color: "#c9d1d9", fontSize: "14px", margin: "0 0 8px" };
