import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PortalRootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("portal_token")?.value;

  if (token) {
    const session = await prisma.clientSession.findUnique({ where: { token } });
    if (session && session.expiresAt > new Date()) {
      redirect("/portal/dashboard");
    }
  }

  redirect("/portal/login");
}
