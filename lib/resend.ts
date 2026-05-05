import { Resend } from "resend";
import { ExpiryAlertEmail } from "@/emails/ExpiryAlert";
import { RenewalConfirmEmail } from "@/emails/RenewalConfirm";
import type { SubscriptionWithRelations } from "@/types";

const apiKey = process.env.RESEND_API_KEY;

// Only create Resend client if API key is available
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = process.env.EMAIL_FROM ?? "SubTrack <alerts@yourdomain.com>";

export async function sendExpiryAlert(
  subscription: SubscriptionWithRelations,
  daysLeft: number
) {
  if (!subscription.client.email) return { success: false, error: "No client email" };
  if (!resend) return { success: false, error: "Resend not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: subscription.client.email,
      subject: `⚠️ Your ${subscription.service.name} subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      react: ExpiryAlertEmail({
        clientName: subscription.client.name,
        serviceName: subscription.service.name,
        expiryDate: subscription.expiryDate,
        daysLeft,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendRenewalConfirm(
  subscription: SubscriptionWithRelations,
  newExpiryDate: Date
) {
  if (!subscription.client.email) return { success: false, error: "No client email" };
  if (!resend) return { success: false, error: "Resend not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: subscription.client.email,
      subject: `✅ Your ${subscription.service.name} subscription has been renewed`,
      react: RenewalConfirmEmail({
        clientName: subscription.client.name,
        serviceName: subscription.service.name,
        newExpiryDate,
      }),
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
