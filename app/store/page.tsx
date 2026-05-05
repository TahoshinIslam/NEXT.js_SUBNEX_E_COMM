import { prisma } from "@/lib/prisma";
import { StorePageClient } from "./StorePageClient";

// For a real deployment, make this dynamic per org via subdomain or slug
const ORG_SLUG = process.env.STORE_ORG_SLUG ?? "my-resell-biz";

// Helper to convert Prisma Decimal to plain number
// Prisma returns Decimal objects which can't be passed to Client Components
function serializeService(service: any) {
  return {
    ...service,
    // Convert Decimal to number if present
    costPrice: service.costPrice != null 
      ? Number(String(service.costPrice)) 
      : undefined,
  };
}

async function getStoreData() {
  const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } });
  if (!org) return null;

  const services = await prisma.service.findMany({
    where: { orgId: org.id, isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Serialize services to convert Decimal to plain numbers
  const serializedServices = services.map(serializeService);

  const testimonials = await prisma.testimonial.findMany({
    where: { orgId: org.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return { org, services: serializedServices, testimonials };
}

export default async function StorePage() {
  const data = await getStoreData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/40">Store not found.</p>
      </div>
    );
  }

  return <StorePageClient orgName={data.org.name} services={data.services} testimonials={data.testimonials} />;
}
