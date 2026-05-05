"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, RefreshCw,
  Package, CreditCard, Edit, User,
} from "lucide-react";
import {
  formatDate, formatCurrency, daysUntilExpiry,
  getStatusColor, getStatusLabel, getPaymentStatusColor,
  getPaymentMethodLabel, getCategoryEmoji, getInitials, cn,
} from "@/lib/utils";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { RenewModal } from "@/components/subscriptions/RenewModal";
import { useToast } from "@/hooks/use-toast";

async function fetchClient(id: string) {
  const res = await fetch(`/api/clients/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"subscriptions" | "payments">("subscriptions");
  const [showEdit, setShowEdit] = useState(false);
  const [renewTarget, setRenewTarget] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => fetchClient(id),
  });

  const client = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted/20 rounded-lg w-48 animate-pulse" />
        <div className="glass rounded-xl p-6 animate-pulse space-y-4">
          <div className="h-16 bg-muted/20 rounded" />
          <div className="h-4 bg-muted/20 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Client not found</p>
        <Link href="/clients" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to clients</Link>
      </div>
    );
  }

  const activeCount = client.subscriptions.filter((s: any) => ["ACTIVE", "EXPIRING_SOON"].includes(s.status)).length;
  const totalRevenue = client.payments.filter((p: any) => p.status === "PAID").reduce((a: number, p: any) => a + Number(p.amount), 0);
  const duePay = client.payments.filter((p: any) => p.status === "DUE").reduce((a: number, p: any) => a + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Clients
      </Link>

      {/* Client card */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {getInitials(client.name)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{client.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                {client.email && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                  </span>
                )}
                {client.address && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {client.address}
                  </span>
                )}
              </div>
              {client.notes && (
                <p className="text-sm text-muted-foreground mt-2 max-w-lg">{client.notes}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          {[
            { label: "Active Subs", value: activeCount, color: "text-emerald-400" },
            { label: "Total Subs", value: client.subscriptions.length, color: "text-blue-400" },
            { label: "Total Paid", value: formatCurrency(totalRevenue), color: "text-emerald-400" },
            { label: "Amount Due", value: formatCurrency(duePay), color: duePay > 0 ? "text-red-400" : "text-muted-foreground" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={cn("text-lg font-bold mt-0.5", color)}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-fit">
        <button
          onClick={() => setTab("subscriptions")}
          className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
            tab === "subscriptions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}
        >
          <Package className="w-3.5 h-3.5" />
          Subscriptions ({client.subscriptions.length})
        </button>
        <button
          onClick={() => setTab("payments")}
          className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
            tab === "payments" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Payments ({client.payments.length})
        </button>
      </div>

      {/* Subscriptions tab */}
      {tab === "subscriptions" && (
        <div className="glass rounded-xl overflow-hidden">
          {client.subscriptions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No subscriptions for this client</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Purchase</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiry</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Price</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {client.subscriptions.map((sub: any) => {
                  const days = daysUntilExpiry(sub.expiryDate);
                  return (
                    <tr key={sub.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{getCategoryEmoji(sub.service.category)}</span>
                          <div>
                            <p className="font-medium">{sub.service.name}</p>
                            <p className="text-xs text-muted-foreground">{sub.durationDays}d plan</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                        {formatDate(sub.purchaseDate)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{formatDate(sub.expiryDate)}</p>
                        <p className={cn("text-xs", days < 0 ? "text-red-400" : days <= 3 ? "text-amber-400" : "text-muted-foreground")}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(sub.status))}>
                          {getStatusLabel(sub.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="font-medium text-emerald-400">{formatCurrency(sub.salePrice)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setRenewTarget(sub)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Renew
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Payments tab */}
      {tab === "payments" && (
        <div className="glass rounded-xl overflow-hidden">
          {client.payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payments recorded</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Method</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {client.payments.map((pay: any) => (
                  <tr key={pay.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {pay.subscription?.service?.name ?? "Direct payment"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-400">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                      {getPaymentMethodLabel(pay.method)}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                      {pay.paidAt ? formatDate(pay.paidAt) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getPaymentStatusColor(pay.status))}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showEdit && (
        <ClientFormModal
          initialData={{ id: client.id, ...client }}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); qc.invalidateQueries({ queryKey: ["client", id] }); }}
        />
      )}

      {renewTarget && (
        <RenewModal
          subscription={renewTarget}
          onClose={() => setRenewTarget(null)}
          onSuccess={() => { setRenewTarget(null); qc.invalidateQueries({ queryKey: ["client", id] }); }}
        />
      )}
    </div>
  );
}
