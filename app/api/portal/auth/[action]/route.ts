import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { addDays } from "date-fns";

const ORG_SLUG = process.env.STORE_ORG_SLUG ?? "my-resell-biz";

// ── LOGIN ──────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.pathname.split("/").pop(); // login | register | logout

  if (action === "logout") {
    const token = req.cookies.get("portal_token")?.value;
    if (token) {
      await prisma.clientSession.deleteMany({ where: { token } }).catch(() => {});
    }
    const res = NextResponse.json({ success: true });
    res.cookies.delete("portal_token");
    return res;
  }

  const body = await req.json();

  if (action === "login") {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const account = await prisma.clientAccount.findUnique({
      where: { email: parsed.data.email },
    });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 401 });

    const valid = await bcrypt.compare(parsed.data.password, account.hashedPassword);
    if (!valid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const session = await prisma.clientSession.create({
      data: {
        accountId: account.id,
        expiresAt: addDays(new Date(), 30),
      },
    });

    const res = NextResponse.json({ success: true, name: account.name });
    res.cookies.set("portal_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }

  if (action === "register") {
    const registerSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      password: z.string().min(6),
    });
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const existing = await prisma.clientAccount.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) return NextResponse.json({ error: "Account already exists with this email" }, { status: 409 });

    const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } });
    if (!org) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // Find or create client record
    let client = await prisma.client.findFirst({
      where: { orgId: org.id, email: parsed.data.email },
    });
    if (!client) {
      client = await prisma.client.create({
        data: {
          orgId: org.id,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const account = await prisma.clientAccount.create({
      data: {
        orgId: org.id,
        clientId: client.id,
        email: parsed.data.email,
        name: parsed.data.name,
        hashedPassword,
      },
    });

    const session = await prisma.clientSession.create({
      data: {
        accountId: account.id,
        expiresAt: addDays(new Date(), 30),
      },
    });

    const res = NextResponse.json({ success: true, name: account.name });
    res.cookies.set("portal_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
