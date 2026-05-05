import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDashboardStats,
  getRevenueByMonth,
  getSubscriptionsByCategory,
  getTopClients,
} from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "stats";

  try {
    switch (type) {
      case "stats":
        return NextResponse.json({ data: await getDashboardStats(session.user.orgId) });
      case "revenue":
        const months = parseInt(searchParams.get("months") ?? "6");
        return NextResponse.json({ data: await getRevenueByMonth(session.user.orgId, months) });
      case "categories":
        return NextResponse.json({ data: await getSubscriptionsByCategory(session.user.orgId) });
      case "top-clients":
        return NextResponse.json({ data: await getTopClients(session.user.orgId) });
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}
