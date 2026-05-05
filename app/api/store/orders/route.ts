import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Resend } from "resend";

const ORG_SLUG = process.env.STORE_ORG_SLUG ?? "my-resell-biz";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const schema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    note: z.string().optional(),
  }),
  paymentMethod: z.string(),
  items: z.array(z.object({
    serviceId: z.string(),
    serviceName: z.string(),
    duration: z.number().int().min(1),
    price: z.number().min(0),
    quantity: z.number().int().min(1),
  })).min(1),
  totalAmount: z.number().min(0),
  createAccount: z.boolean().default(false),
  password: z.string().min(6).optional(),
});

async function generateOrderNumber(orgId: string): Promise<string> {
  const count = await prisma.order.count({ where: { orgId } });
  return `ORD-${String(count + 1).padStart(5, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { customer, paymentMethod, items, totalAmount, createAccount, password } = parsed.data;

    // Get org
    const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } });
    if (!org) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // Check if client already exists
    let client = customer.email
      ? await prisma.client.findFirst({
          where: { orgId: org.id, email: customer.email },
        })
      : null;

    // Create client if new
    if (!client) {
      client = await prisma.client.create({
        data: {
          orgId: org.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      });
    }

    const orderNumber = await generateOrderNumber(org.id);

    // Create order + items in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orgId: org.id,
          clientId: client!.id,
          orderNumber,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerNote: customer.note,
          totalAmount,
          status: "PENDING",
          items: {
            create: items.map((item) => ({
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              duration: item.duration,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orgId: org.id,
          clientId: client!.id,
          amount: totalAmount,
          status: "DUE",
          method: paymentMethod as any,
          note: `Order ${orderNumber}`,
        },
      });

      return newOrder;
    });

    // Create client portal account if requested
    if (createAccount && password) {
      const existing = await prisma.clientAccount.findUnique({
        where: { email: customer.email },
      });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.clientAccount.create({
          data: {
            orgId: org.id,
            clientId: client.id,
            email: customer.email,
            name: customer.name,
            hashedPassword,
          },
        });
      }
    }

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail({
      to: customer.email,
      name: customer.name,
      orderNumber,
      items,
      totalAmount,
      paymentMethod,
    }).catch(console.error);

    return NextResponse.json({ data: { orderNumber, id: order.id } }, { status: 201 });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Public: allow checking order status by email + orderNumber
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const orderNumber = searchParams.get("orderNumber");

  if (!email || !orderNumber) {
    return NextResponse.json({ error: "email and orderNumber required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerEmail: email },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ data: order });
}

async function sendOrderConfirmationEmail({
  to, name, orderNumber, items, totalAmount, paymentMethod,
}: {
  to: string; name: string; orderNumber: string;
  items: any[]; totalAmount: number; paymentMethod: string;
}) {
  // Skip if Resend is not configured
  if (!resend) {
    console.log(`[Email] RESEND_API_KEY not set. Skipping email to ${to}`);
    return;
  }

  const itemList = items
    .map((i) => `• ${i.serviceName} (${i.duration} days) × ${i.quantity} — ৳${(i.price * i.quantity).toLocaleString()}`)
    .join("\n");

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "SubTrack <orders@yourdomain.com>",
    to,
    subject: `✅ Order Confirmed — ${orderNumber}`,
    text: `Hi ${name},\n\nYour order ${orderNumber} has been placed!\n\nItems:\n${itemList}\n\nTotal: ৳${totalAmount.toLocaleString()}\nPayment: ${paymentMethod}\n\nWe'll deliver your credentials within 24 hours.\n\nTrack your order at: ${process.env.NEXTAUTH_URL}/portal/orders\n\nThanks,\nSubTrack Team`,
  });
}
