import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addDays } from "date-fns";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: { id, orgId: session.user.orgId },
      include: { items: true, client: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { items: true },
    });

    // When fulfilled, mark linked payment as paid AND create subscriptions
    if (parsed.data.status === "FULFILLED") {
      await prisma.payment.updateMany({
        where: {
          orgId: session.user.orgId,
          clientId: order.clientId ?? undefined,
          note: { contains: order.orderNumber },
        },
        data: { status: "PAID", paidAt: new Date() },
      });

      // Create subscriptions from order items
      const subscriptions = await Promise.all(
        order.items.map((item) =>
          prisma.subscription.create({
            data: {
              orgId: order.orgId,
              clientId: order.clientId!,
              serviceId: item.serviceId,
              status: "ACTIVE",
              purchaseDate: new Date(),
              durationDays: item.duration,
              expiryDate: addDays(new Date(), item.duration),
              salePrice: item.price,
            },
          })
        )
      );

      // Send credentials email (non-blocking)
      sendCredentialsEmail({
        to: order.customerEmail,
        name: order.customerName,
        orderNumber: order.orderNumber,
        items: order.items,
      }).catch(console.error);

      return NextResponse.json({ 
        data: { 
          order: updated, 
          subscriptionsCreated: subscriptions.length 
        } 
      });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Order update failed:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

async function sendCredentialsEmail({
  to, name, orderNumber, items,
}: {
  to: string;
  name: string;
  orderNumber: string;
  items: { serviceName: string; duration: number }[];
}) {
  const itemList = items
    .map((i) => `• ${i.serviceName} (${i.duration} days) — Valid until ${new Date(Date.now() + i.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}`)
    .join("\n");

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "SubTrack <orders@yourdomain.com>",
    to,
    subject: `🎉 Your Order ${orderNumber} is Ready!`,
    text: `Hi ${name},\n\nGreat news! Your order ${orderNumber} has been fulfilled.\n\nYour subscriptions are now active:\n${itemList}\n\nYou can manage and track your subscriptions at:\n${process.env.NEXTAUTH_URL}/portal/dashboard\n\nThanks for your purchase!\n\nSubTrack Team`,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { id, orgId: session.user.orgId },
    include: {
      items: { include: { service: { select: { name: true, category: true } } } },
      client: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: order });
}
