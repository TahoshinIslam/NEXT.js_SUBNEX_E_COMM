import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getPortalAccount(redirectOnFail = true) {
  const cookieStore = await cookies();
  const token = cookieStore.get("portal_token")?.value;

  if (!token) {
    if (redirectOnFail) redirect("/portal/login");
    return null;
  }

  const session = await prisma.clientSession.findUnique({
    where: { token },
    include: {
      account: {
        include: {
          client: {
            include: {
              subscriptions: {
                include: {
                  service: { select: { id: true, name: true, category: true } },
                },
                orderBy: { expiryDate: "asc" },
              },
              orders: {
                include: { items: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (redirectOnFail) redirect("/portal/login");
    return null;
  }

  return session.account;
}
