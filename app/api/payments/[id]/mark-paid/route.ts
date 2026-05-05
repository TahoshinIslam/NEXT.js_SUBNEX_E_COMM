import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markPaymentPaid } from "@/services/payment.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const payment = await markPaymentPaid(id, session.user.orgId, body.method);
    return NextResponse.json({ data: payment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
