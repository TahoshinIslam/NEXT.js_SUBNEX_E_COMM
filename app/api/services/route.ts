import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["AI", "STREAMING", "EDITING", "PRODUCTIVITY", "CLOUD", "MUSIC", "SECURITY", "GAMING", "OTHER"]),
  description: z.string().optional(),
  costPrice: z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const services = await prisma.service.findMany({
    where: { orgId: session.user.orgId, isActive: true },
    include: { _count: { select: { subscriptions: true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ data: services });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const service = await prisma.service.create({
      data: { ...parsed.data, orgId: session.user.orgId },
    });

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
