import { prisma } from "@/lib/prisma";
import type { CreatePaymentInput } from "@/types";

export async function getPayments(orgId: string, filters?: {
  status?: string;
  clientId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { status, clientId, page = 1, pageSize = 20 } = filters ?? {};

  const where = {
    orgId,
    ...(status && status !== "ALL" ? { status: status as any } : {}),
    ...(clientId ? { clientId } : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        subscription: {
          select: {
            id: true,
            expiryDate: true,
            service: { select: { name: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPayment(orgId: string, input: CreatePaymentInput) {
  return prisma.payment.create({
    data: {
      orgId,
      clientId: input.clientId,
      subscriptionId: input.subscriptionId,
      amount: input.amount,
      method: input.method as any,
      status: "DUE",
      note: input.note,
    },
    include: {
      client: { select: { id: true, name: true } },
      subscription: {
        select: {
          id: true,
          expiryDate: true,
          service: { select: { name: true, category: true } },
        },
      },
    },
  });
}

export async function markPaymentPaid(id: string, orgId: string, method?: string) {
  const payment = await prisma.payment.findFirst({ where: { id, orgId } });
  if (!payment) throw new Error("Payment not found");

  return prisma.payment.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      method: method as any ?? payment.method,
    },
  });
}

export async function deletePayment(id: string, orgId: string) {
  const payment = await prisma.payment.findFirst({ where: { id, orgId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "PAID") throw new Error("Cannot delete a paid payment");

  return prisma.payment.delete({ where: { id } });
}
