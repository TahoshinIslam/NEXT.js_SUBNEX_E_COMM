"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Package, Plus, RefreshCw } from "lucide-react";
import {
  formatDate, daysUntilExpiry, getStatusColor, getStatusLabel,
  getCategoryEmoji, formatCurrency, cn,
} from "@/lib/utils";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";
import { RenewModal } from "@/components/subscriptions/RenewModal";

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRING_SOON", label: "Expiring Soon" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

async function fetchSubs(status: string, page: number) {
  const params = new URLSearchParams({
    ...(status !== "ALL" ? { status } : {}),
    page: String(page),
    pageSize: "20",
  });
  const res = await fetch(`/api/subscriptions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function SubscriptionsPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [renewTarget, setRenewTarget] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["subscriptions", status, page],
    queryFn: () => fetchSubs(status, page),
  });

  const subs = data?.subscriptions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Subscription
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              status === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Expiry</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Price</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-4 bg-muted/30 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>No subscriptions found</p>
                </td>
              </tr>
            ) : (
              subs.map((sub: any) => {
                const days = daysUntilExpiry(sub.expiryDate);
                return (
                  <tr key={sub.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{getCategoryEmoji(sub.service.category)}</span>
                        <div>
                          <p className="font-medium">{sub.service.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.service.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/clients/${sub.client.id}`} className="hover:text-primary transition-colors">
                        <p className="font-medium">{sub.client.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.client.phone ?? sub.client.email ?? "—"}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="font-medium">{formatDate(sub.expiryDate)}</p>
                      <p className={cn("text-xs", days < 0 ? "text-red-400" : days <= 3 ? "text-amber-400" : "text-muted-foreground")}>
                        {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `${days}d left`}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="font-medium text-emerald-400">{formatCurrency(sub.salePrice)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(sub.status))}>
                        {getStatusLabel(sub.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRenewTarget(sub)}
                          className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                          title="Renew"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Page {page} of {data.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-md text-xs border border-border hover:bg-accent disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="px-3 py-1.5 rounded-md text-xs border border-border hover:bg-accent disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <SubscriptionFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); refetch(); }}
        />
      )}

      {renewTarget && (
        <RenewModal
          subscription={renewTarget}
          onClose={() => setRenewTarget(null)}
          onSuccess={() => { setRenewTarget(null); refetch(); }}
        />
      )}
    </div>
  );
}
