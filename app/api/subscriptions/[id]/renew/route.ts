import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renewSubscription } from "@/services/subscription.service";
import { sendRenewalConfirm } from "@/lib/resend";
import { z } from "zod";

const renewSchema = z.object({
  durationDays: z.number().int().min(1).max(3650),
  salePrice: z.number().min(0),
  purchaseDate: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = renewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await renewSubscription(session.user.orgId, {
      subscriptionId: id,
      ...parsed.data,
    });

    // Send confirmation email (non-blocking)
    sendRenewalConfirm(updated, updated.expiryDate).catch(console.error);

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
