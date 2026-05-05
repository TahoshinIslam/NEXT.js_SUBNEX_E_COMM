import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TestimonialsClient } from "./TestimonialsClient";

export default async function TestimonialsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const testimonials = await prisma.testimonial.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground text-sm">
            Manage the customer reviews shown on your store page.
          </p>
        </div>
      </div>

      <TestimonialsClient testimonials={testimonials} orgId={session.user.orgId} />
    </div>
  );
}
