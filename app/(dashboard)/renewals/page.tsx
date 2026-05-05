"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, AlertTriangle } from "lucide-react";
import {
  formatDate, daysUntilExpiry, formatCurrency,
  getCategoryEmoji, getStatusColor, getStatusLabel, cn,
} from "@/lib/utils";
import { RenewModal } from "@/components/subscriptions/RenewModal";

async function fetchExpiring() {
  const res = await fetch("/api/subscriptions?status=EXPIRING_SOON&pageSize=50");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchExpired() {
  const res = await fetch("/api/subscriptions?status=EXPIRED&pageSize=50");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function RenewalsPage() {
  const [renewTarget, setRenewTarget] = useState<any>(null);
  const [tab, setTab] = useState<"expiring" | "expired">("expiring");

  const { data: expiringData, refetch: refetchExpiring } = useQuery({
    queryKey: ["expiring"],
    queryFn: fetchExpiring,
  });

  const { data: expiredData, refetch: refetchExpired } = useQuery({
    queryKey: ["expired"],
    queryFn: fetchExpired,
  });

  const expiring = expiringData?.subscriptions ?? [];
  const expired = expiredData?.subscriptions ?? [];
  const shown = tab === "expiring" ? expiring : expired;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renewals</h1>
        <p className="text-muted-foreground text-sm mt-1">Subscriptions needing attention</p>
      </div>

      {/* Alert Banner */}
      {expiring.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            {expiring.length} subscription{expiring.length !== 1 ? "s" : ""} expiring soon — renew now to avoid losing clients
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-fit">
        <button
          onClick={() => setTab("expiring")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
            tab === "expiring" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          Expiring Soon ({expiring.length})
        </button>
        <button
          onClick={() => setTab("expired")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
            tab === "expired" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          Expired ({expired.length})
        </button>
      </div>

      {/* Cards */}
      {shown.length === 0 ? (
        <div className="glass rounded-xl py-16 text-center">
          <RefreshCw className="w-10 h-10 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">
            {tab === "expiring" ? "🎉 No subscriptions expiring soon!" : "No expired subscriptions"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((sub: any) => {
            const days = daysUntilExpiry(sub.expiryDate);
            const urgency = days <= 0 ? "red" : days <= 1 ? "red" : "amber";
            return (
              <div key={sub.id} className={cn(
                "glass rounded-xl p-5 flex flex-col gap-4 border",
                urgency === "red" ? "border-red-400/25" : "border-amber-400/25"
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{getCategoryEmoji(sub.service.category)}</span>
                    <div>
                      <p className="font-semibold text-sm">{sub.service.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.client.name}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border shrink-0", getStatusColor(sub.status))}>
                    {getStatusLabel(sub.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry</p>
                    <p className="text-sm font-medium mt-0.5">{formatDate(sub.expiryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time left</p>
                    <p className={cn("text-sm font-bold mt-0.5", urgency === "red" ? "text-red-400" : "text-amber-400")}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-medium text-emerald-400 mt-0.5">{formatCurrency(sub.salePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm mt-0.5">{sub.client.phone ?? "—"}</p>
                  </div>
                </div>

                <button
                  onClick={() => setRenewTarget(sub)}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Renew Now
                </button>
              </div>
            );
          })}
        </div>
      )}

      {renewTarget && (
        <RenewModal
          subscription={renewTarget}
          onClose={() => setRenewTarget(null)}
          onSuccess={() => {
            setRenewTarget(null);
            refetchExpiring();
            refetchExpired();
          }}
        />
      )}
    </div>
  );
}
