import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createPayment, getPayments, markPaymentPaid } from "@/services/payment.service";
import { PaymentMethod } from "@prisma/client";

const createSchema = z.object({
  clientId: z.string().min(1),
  subscriptionId: z.string().optional(),
  amount: z.number().min(0),
  method: z.nativeEnum(PaymentMethod).optional(),
  paidAt: z.string().optional(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const result = await getPayments(session.user.orgId, { status, clientId, page, pageSize });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payment = await createPayment(session.user.orgId, parsed.data);
    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
