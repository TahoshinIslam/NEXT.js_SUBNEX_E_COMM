import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findFirst({
    where: { id, orgId: session.user.orgId },
    include: {
      subscriptions: {
        include: {
          service: { select: { id: true, name: true, category: true, iconUrl: true } },
          payments: true,
        },
        orderBy: { expiryDate: "desc" },
      },
      payments: {
        include: {
          subscription: {
            select: {
              id: true,
              expiryDate: true,
              service: { select: { name: true, category: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json({ data: client });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.client.findFirst({
      where: { id, orgId: session.user.orgId },
    });
    if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const updated = await prisma.client.update({
      where: { id },
      data: { ...parsed.data, email: parsed.data.email || undefined },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.client.findFirst({
    where: { id, orgId: session.user.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // Soft delete
  await prisma.client.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Client deactivated" });
}
