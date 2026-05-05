// Add to getDashboardStats in analytics.service.ts
// This patch adds order stats to the existing analytics

import { prisma } from "@/lib/prisma";

export async function getOrderStats(orgId: string) {
  const [pending, confirmed, fulfilled, totalOrders] = await Promise.all([
    prisma.order.count({ where: { orgId, status: "PENDING" } }),
    prisma.order.count({ where: { orgId, status: "CONFIRMED" } }),
    prisma.order.count({ where: { orgId, status: "FULFILLED" } }),
    prisma.order.count({ where: { orgId } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });

  return { pending, confirmed, fulfilled, totalOrders, recentOrders };
}
