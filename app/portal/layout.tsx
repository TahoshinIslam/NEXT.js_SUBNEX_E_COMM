import type { Metadata } from "next";
import { PortalNav } from "@/components/portal/PortalNav";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Account — SubTrack",
};

async function getPortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("portal_token")?.value;
  if (!token) return null;

  const session = await prisma.clientSession.findUnique({
    where: { token },
    include: { account: { include: { client: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.account;
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const account = await getPortalSession();

  // Public pages (login/register) handle their own redirect
  return (
    <div className="min-h-screen bg-[#080c10]">
      <PortalNav account={account} />
      <main className="max-w-4xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
