"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTestimonials(orgId: string) {
  return prisma.testimonial.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTestimonial(data: {
  orgId: string;
  name: string;
  location?: string;
  text: string;
  rating?: number;
}) {
  await prisma.testimonial.create({
    data: {
      orgId: data.orgId,
      name: data.name,
      location: data.location,
      text: data.text,
      rating: data.rating ?? 5,
    },
  });
  revalidatePath("/(dashboard)/testimonials", "page");
  revalidatePath("/store", "page");
}

export async function updateTestimonial(
  id: string,
  data: { name?: string; location?: string; text?: string; rating?: number; isActive?: boolean }
) {
  await prisma.testimonial.update({
    where: { id },
    data,
  });
  revalidatePath("/(dashboard)/testimonials", "page");
  revalidatePath("/store", "page");
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({
    where: { id },
  });
  revalidatePath("/(dashboard)/testimonials", "page");
  revalidatePath("/store", "page");
}

export async function toggleTestimonialActive(id: string, isActive: boolean) {
  await prisma.testimonial.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/(dashboard)/testimonials", "page");
  revalidatePath("/store", "page");
}
