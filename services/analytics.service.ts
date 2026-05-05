import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import type { DashboardStats, RevenueByMonth, SubscriptionsByCategory } from "@/types";

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalClients,
    activeSubscriptions,
    expiringSoon,
    expiredCount,
    revenueAll,
    pendingPayments,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.client.count({ where: { orgId, isActive: true } }),
    prisma.subscription.count({ where: { orgId, status: "ACTIVE" } }),
    prisma.subscription.count({ where: { orgId, status: "EXPIRING_SOON" } }),
    prisma.subscription.count({ where: { orgId, status: "EXPIRED" } }),
    prisma.payment.aggregate({
      where: { orgId, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { orgId, status: "DUE" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        orgId,
        status: "PAID",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  // MRR = sum of active subscription prices / their duration * 30
  const activeSubs = await prisma.subscription.findMany({
    where: { orgId, status: { in: ["ACTIVE", "EXPIRING_SOON"] } },
    select: { salePrice: true, durationDays: true },
  });

  const mrr = activeSubs.reduce((acc, sub) => {
    const monthlyEquiv = (Number(sub.salePrice) / sub.durationDays) * 30;
    return acc + monthlyEquiv;
  }, 0);

  return {
    totalClients,
    activeSubscriptions,
    expiringSoon,
    expiredCount,
    totalRevenue: Number(revenueAll._sum.amount ?? 0),
    pendingPayments: Number(pendingPayments._sum.amount ?? 0),
    mrr: Math.round(mrr * 100) / 100,
    revenueThisMonth: Number(revenueThisMonth._sum.amount ?? 0),
  };
}

export async function getRevenueByMonth(orgId: string, months = 6): Promise<RevenueByMonth[]> {
  const results: RevenueByMonth[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const agg = await prisma.payment.aggregate({
      where: {
        orgId,
        status: "PAID",
        paidAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
      _count: true,
    });

    results.push({
      month: format(date, "MMM yy"),
      revenue: Number(agg._sum.amount ?? 0),
      count: agg._count,
    });
  }

  return results;
}

export async function getSubscriptionsByCategory(orgId: string): Promise<SubscriptionsByCategory[]> {
  const subs = await prisma.subscription.findMany({
    where: { orgId, status: { in: ["ACTIVE", "EXPIRING_SOON"] } },
    include: {
      service: { select: { category: true } },
    },
  });

  const map = new Map<string, { count: number; revenue: number }>();

  for (const sub of subs) {
    const cat = sub.service.category;
    const existing = map.get(cat) ?? { count: 0, revenue: 0 };
    map.set(cat, {
      count: existing.count + 1,
      revenue: existing.revenue + Number(sub.salePrice),
    });
  }

  return Array.from(map.entries()).map(([category, data]) => ({
    category: category as any,
    ...data,
  }));
}

export async function getTopClients(orgId: string, limit = 5) {
  const clients = await prisma.client.findMany({
    where: { orgId },
    include: {
      payments: {
        where: { status: "PAID" },
        select: { amount: true },
      },
      _count: { select: { subscriptions: true } },
    },
  });

  return clients
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      totalPaid: c.payments.reduce((acc, p) => acc + Number(p.amount), 0),
      subscriptionCount: c._count.subscriptions,
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, limit);
}
