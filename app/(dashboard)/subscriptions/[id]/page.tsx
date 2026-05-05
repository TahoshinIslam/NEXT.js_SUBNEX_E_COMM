"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, XCircle, Clock,
  Calendar, DollarSign, FileText, History,
} from "lucide-react";
import {
  formatDate, formatDateTime, formatCurrency, daysUntilExpiry,
  getStatusColor, getStatusLabel, getCategoryEmoji,
  getPaymentStatusColor, getPaymentMethodLabel, cn,
} from "@/lib/utils";
import { RenewModal } from "@/components/subscriptions/RenewModal";
import { useToast } from "@/hooks/use-toast";

async function fetchSub(id: string) {
  const res = await fetch(`/api/subscriptions/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showRenew, setShowRenew] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["subscription", id],
    queryFn: () => fetchSub(id),
  });

  const sub = data?.data;

  async function cancelSub() {
    if (!confirm("Cancel this subscription? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Subscription cancelled" });
      qc.invalidateQueries({ queryKey: ["subscription", id] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-8 bg-muted/20 rounded-lg w-48 animate-pulse" />
      <div className="glass rounded-xl p-6 animate-pulse h-48" />
    </div>;
  }

  if (!sub) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Subscription not found</p>
      <Link href="/subscriptions" className="text-primary text-sm hover:underline mt-2 inline-block">← Back</Link>
    </div>
  );

  const days = daysUntilExpiry(sub.expiryDate);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/subscriptions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Subscriptions
      </Link>

      {/* Header card */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl">
              {getCategoryEmoji(sub.service.category)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{sub.service.name}</h1>
              <Link href={`/clients/${sub.client.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {sub.client.name}
              </Link>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(sub.status))}>
                  {getStatusLabel(sub.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRenew(true)}
              disabled={sub.status === "CANCELLED"}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Renew
            </button>
            {sub.status !== "CANCELLED" && (
              <button
                onClick={cancelSub}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-40 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <DetailStat icon={Calendar} label="Purchase Date" value={formatDate(sub.purchaseDate)} />
          <DetailStat icon={Clock} label="Duration" value={`${sub.durationDays} days`} />
          <DetailStat
            icon={Clock}
            label="Expiry"
            value={formatDate(sub.expiryDate)}
            sub={days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
            subColor={days <= 0 ? "text-red-400" : days <= 3 ? "text-amber-400" : "text-muted-foreground"}
          />
          <DetailStat icon={DollarSign} label="Sale Price" value={formatCurrency(sub.salePrice)} valueColor="text-emerald-400" />
        </div>
      </div>

      {/* Credentials */}
      {sub.credentials && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Credentials / Login Info</h3>
          </div>
          <pre className="text-sm bg-background rounded-lg p-3 border border-border font-mono text-muted-foreground whitespace-pre-wrap break-all">
            {sub.credentials}
          </pre>
        </div>
      )}

      {/* Notes */}
      {sub.notes && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{sub.notes}</p>
        </div>
      )}

      {/* Payment history */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Payment Records</h3>
        </div>
        {sub.payments.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No payments yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Method</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Paid At</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sub.payments.map((pay: any) => (
                <tr key={pay.id} className="hover:bg-accent/30">
                  <td className="px-5 py-3.5 font-semibold text-emerald-400">{formatCurrency(pay.amount)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{getPaymentMethodLabel(pay.method)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{pay.paidAt ? formatDate(pay.paidAt) : "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", getPaymentStatusColor(pay.status))}>
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Audit history */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">History</h3>
        </div>
        {sub.history.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No history yet</p>
        ) : (
          <div className="divide-y divide-border/50">
            {sub.history.map((h: any) => (
              <div key={h.id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{h.action}</p>
                    <p className="text-xs text-muted-foreground shrink-0">{formatDateTime(h.performedAt)}</p>
                  </div>
                  {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                  {h.newExpiry && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      New expiry: <span className="text-foreground">{formatDate(h.newExpiry)}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRenew && (
        <RenewModal
          subscription={sub}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); qc.invalidateQueries({ queryKey: ["subscription", id] }); }}
        />
      )}
    </div>
  );
}

function DetailStat({ icon: Icon, label, value, sub, subColor, valueColor }: {
  icon: any; label: string; value: string;
  sub?: string; subColor?: string; valueColor?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <p className={cn("font-semibold", valueColor)}>{value}</p>
      {sub && <p className={cn("text-xs mt-0.5", subColor)}>{sub}</p>}
    </div>
  );
}
