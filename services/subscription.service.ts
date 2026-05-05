import { prisma } from "@/lib/prisma";
import { calculateExpiryDate, computeSubscriptionStatus } from "@/lib/utils";
import type { CreateSubscriptionInput, RenewSubscriptionInput } from "@/types";
import { addDays } from "date-fns";

export async function getSubscriptions(orgId: string, filters?: {
  status?: string;
  clientId?: string;
  serviceId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { status, clientId, serviceId, page = 1, pageSize = 20 } = filters ?? {};

  const where = {
    orgId,
    ...(status && status !== "ALL" ? { status: status as any } : {}),
    ...(clientId ? { clientId } : {}),
    ...(serviceId ? { serviceId } : {}),
  };

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, category: true, iconUrl: true } },
        payments: true,
      },
      orderBy: { expiryDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.subscription.count({ where }),
  ]);

  return { subscriptions, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getSubscriptionById(id: string, orgId: string) {
  return prisma.subscription.findFirst({
    where: { id, orgId },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { id: true, name: true, category: true, iconUrl: true } },
      payments: { orderBy: { createdAt: "desc" } },
      history: { orderBy: { performedAt: "desc" } },
    },
  });
}

export async function createSubscription(orgId: string, input: CreateSubscriptionInput) {
  const purchaseDate = new Date(input.purchaseDate);
  const expiryDate = calculateExpiryDate(purchaseDate, input.durationDays);
  const status = computeSubscriptionStatus(expiryDate);

  const subscription = await prisma.subscription.create({
    data: {
      orgId,
      clientId: input.clientId,
      serviceId: input.serviceId,
      purchaseDate,
      durationDays: input.durationDays,
      expiryDate,
      salePrice: input.salePrice,
      credentials: input.credentials,
      notes: input.notes,
      autoRenew: input.autoRenew ?? false,
      status,
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { id: true, name: true, category: true, iconUrl: true } },
      payments: true,
    },
  });

  // Auto-create a DUE payment entry
  await prisma.payment.create({
    data: {
      orgId,
      clientId: input.clientId,
      subscriptionId: subscription.id,
      amount: input.salePrice,
      status: "DUE",
    },
  });

  // Log history
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: subscription.id,
      action: "CREATED",
      newExpiry: expiryDate,
      note: `Created for ${input.durationDays} days`,
    },
  });

  return subscription;
}

export async function renewSubscription(orgId: string, input: RenewSubscriptionInput) {
  const existing = await prisma.subscription.findFirst({
    where: { id: input.subscriptionId, orgId },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { id: true, name: true, category: true, iconUrl: true } },
      payments: true,
    },
  });

  if (!existing) throw new Error("Subscription not found");

  const purchaseDate = input.purchaseDate ? new Date(input.purchaseDate) : new Date();
  // If renewing an active sub, extend from current expiry; otherwise start fresh
  const baseDate = existing.status === "ACTIVE" && existing.expiryDate > new Date()
    ? existing.expiryDate
    : purchaseDate;

  const newExpiryDate = addDays(baseDate, input.durationDays);
  const newStatus = computeSubscriptionStatus(newExpiryDate);

  const updated = await prisma.subscription.update({
    where: { id: input.subscriptionId },
    data: {
      purchaseDate,
      durationDays: input.durationDays,
      expiryDate: newExpiryDate,
      salePrice: input.salePrice,
      status: newStatus,
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { id: true, name: true, category: true, iconUrl: true } },
      payments: true,
    },
  });

  // Create payment for renewal
  await prisma.payment.create({
    data: {
      orgId,
      clientId: existing.clientId,
      subscriptionId: existing.id,
      amount: input.salePrice,
      status: "DUE",
      note: "Renewal payment",
    },
  });

  // Log history
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: existing.id,
      action: "RENEWED",
      previousExpiry: existing.expiryDate,
      newExpiry: newExpiryDate,
      note: `Renewed for ${input.durationDays} days`,
    },
  });

  return updated;
}

export async function cancelSubscription(id: string, orgId: string) {
  const sub = await prisma.subscription.findFirst({ where: { id, orgId } });
  if (!sub) throw new Error("Subscription not found");

  const updated = await prisma.subscription.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: id,
      action: "CANCELLED",
      note: "Manually cancelled",
    },
  });

  return updated;
}

export async function getExpiringSoon(orgId: string, days = 3) {
  const cutoff = addDays(new Date(), days);
  return prisma.subscription.findMany({
    where: {
      orgId,
      status: { in: ["ACTIVE", "EXPIRING_SOON"] },
      expiryDate: { lte: cutoff, gte: new Date() },
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { id: true, name: true, category: true, iconUrl: true } },
      payments: true,
    },
    orderBy: { expiryDate: "asc" },
  });
}

// Called by daily cron to bulk-update statuses
export async function syncAllStatuses(orgId: string) {
  const now = new Date();
  const threeDaysOut = addDays(now, 3);

  // Expire overdue
  await prisma.subscription.updateMany({
    where: {
      orgId,
      status: { in: ["ACTIVE", "EXPIRING_SOON"] },
      expiryDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  // Mark expiring soon
  await prisma.subscription.updateMany({
    where: {
      orgId,
      status: "ACTIVE",
      expiryDate: { gte: now, lte: threeDaysOut },
    },
    data: { status: "EXPIRING_SOON" },
  });

  // Restore active (if somehow re-extended)
  await prisma.subscription.updateMany({
    where: {
      orgId,
      status: "EXPIRING_SOON",
      expiryDate: { gt: threeDaysOut },
    },
    data: { status: "ACTIVE" },
  });
}
