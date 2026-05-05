import { NextRequest, NextResponse } from "next/server";
import { runDailyExpiryCheck } from "@/services/notification.service";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔔 Running daily expiry check cron...");
    const results = await runDailyExpiryCheck();
    console.log("✅ Cron complete:", results);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Cron failed:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
