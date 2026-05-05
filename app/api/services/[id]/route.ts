import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = await prisma.service.findFirst({
    where: { id, orgId: session.user.orgId },
    include: { _count: { select: { subscriptions: true } } },
  });

  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  if (service._count.subscriptions > 0) {
    return NextResponse.json({ error: "Cannot delete a service with active subscriptions" }, { status: 400 });
  }

  await prisma.service.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ message: "Service removed" });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const service = await prisma.service.findFirst({
      where: { id, orgId: session.user.orgId },
    });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.service.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
