import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createSubscription, getSubscriptions } from "@/services/subscription.service";

const createSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  purchaseDate: z.string().min(1),
  durationDays: z.number().int().min(1).max(3650),
  salePrice: z.number().min(0),
  credentials: z.string().optional(),
  notes: z.string().optional(),
  autoRenew: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;
  const serviceId = searchParams.get("serviceId") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const result = await getSubscriptions(session.user.orgId, {
    status, clientId, serviceId, page, pageSize,
  });

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

    const subscription = await createSubscription(session.user.orgId, parsed.data);
    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
