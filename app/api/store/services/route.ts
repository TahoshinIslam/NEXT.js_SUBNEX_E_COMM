import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ORG_SLUG = process.env.STORE_ORG_SLUG ?? "my-resell-biz";

// Helper to convert Prisma Decimal to plain number
function serializeService(service: any) {
  return {
    ...service,
    costPrice: service.costPrice != null ? Number(String(service.costPrice)) : undefined,
  };
}

export async function GET(req: NextRequest) {
  const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } });
  if (!org) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const services = await prisma.service.findMany({
    where: {
      orgId: org.id,
      isActive: true,
      ...(category ? { category: category as any } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Serialize services to convert Decimal to plain numbers
  const serializedServices = services.map(serializeService);

  return NextResponse.json({ data: serializedServices });
}
