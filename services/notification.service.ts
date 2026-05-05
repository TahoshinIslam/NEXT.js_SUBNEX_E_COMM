import { prisma } from "@/lib/prisma";
import { sendExpiryAlert } from "@/lib/resend";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { syncAllStatuses } from "./subscription.service";
import type { AlertType } from "@prisma/client";

interface AlertCheck {
  daysLeft: number;
  alertType: AlertType;
}

const ALERT_CHECKS: AlertCheck[] = [
  { daysLeft: 3, alertType: "EXPIRY_3DAY" },
  { daysLeft: 1, alertType: "EXPIRY_1DAY" },
  { daysLeft: 0, alertType: "EXPIRY_TODAY" },
];

export async function runDailyExpiryCheck(orgId?: string) {
  const orgs = orgId
    ? [{ id: orgId }]
    : await prisma.organization.findMany({ select: { id: true } });

  const results = { checked: 0, sent: 0, skipped: 0, errors: 0 };

  for (const org of orgs) {
    // First sync statuses
    await syncAllStatuses(org.id);

    for (const { daysLeft, alertType } of ALERT_CHECKS) {
      const targetDate = addDays(new Date(), daysLeft);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);

      const subs = await prisma.subscription.findMany({
        where: {
          orgId: org.id,
          status: { in: ["ACTIVE", "EXPIRING_SOON"] },
          expiryDate: { gte: dayStart, lte: dayEnd },
        },
        include: {
          client: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, category: true, iconUrl: true } },
          payments: true,
          // Check if alert already sent today
          alerts: {
            where: {
              alertType,
              sentAt: { gte: dayStart },
            },
          },
        },
      });

      for (const sub of subs) {
        results.checked++;

        // Skip if already alerted today
        if (sub.alerts.length > 0) {
          results.skipped++;
          continue;
        }

        if (!sub.client.email) {
          results.skipped++;
          continue;
        }

        const sendResult = await sendExpiryAlert(sub, daysLeft);

        if (sendResult.success) {
          // Log the alert
          await prisma.alertLog.create({
            data: {
              orgId: org.id,
              subscriptionId: sub.id,
              alertType,
              deliveredTo: sub.client.email,
              success: true,
            },
          });
          results.sent++;
        } else {
          await prisma.alertLog.create({
            data: {
              orgId: org.id,
              subscriptionId: sub.id,
              alertType,
              deliveredTo: sub.client.email,
              success: false,
            },
          });
          results.errors++;
        }
      }
    }
  }

  return results;
}
