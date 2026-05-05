"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, CheckCircle, Clock } from "lucide-react";
import {
  formatDate, formatCurrency, getPaymentStatusColor,
  getPaymentMethodLabel, cn,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_TABS = ["ALL", "DUE", "PAID", "PARTIAL"];

async function fetchPayments(status: string, page: number) {
  const params = new URLSearchParams({
    ...(status !== "ALL" ? { status } : {}),
    page: String(page),
    pageSize: "25",
  });
  const res = await fetch(`/api/payments?${params}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function PaymentsPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["payments", status, page],
    queryFn: () => fetchPayments(status, page),
  });

  const markPaid = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: string }) => {
      const res = await fetch(`/api/payments/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) throw new Error("Failed to mark paid");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Payment marked as paid!" });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const payments = data?.payments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Track all income and dues</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Paid", value: formatCurrency(payments.filter((p: any) => p.status === "PAID").reduce((a: number, p: any) => a + Number(p.amount), 0)), color: "text-emerald-400" },
          { label: "Due Amount", value: formatCurrency(payments.filter((p: any) => p.status === "DUE").reduce((a: number, p: any) => a + Number(p.amount), 0)), color: "text-red-400" },
          { label: "Total Records", value: data?.total ?? 0, color: "text-blue-400" },
          { label: "Overdue Clients", value: new Set(payments.filter((p: any) => p.status === "DUE").map((p: any) => p.clientId)).size, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setStatus(t); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              status === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Service</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Method</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>No payments found</p>
                </td>
              </tr>
            ) : (
              payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium">{payment.client?.name}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-muted-foreground text-xs">
                      {payment.subscription?.service?.name ?? "Direct payment"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-emerald-400">{formatCurrency(payment.amount)}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                    {getPaymentMethodLabel(payment.method)}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                    {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getPaymentStatusColor(payment.status))}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {payment.status === "DUE" && (
                      <button
                        onClick={() => markPaid.mutate({ id: payment.id, method: "CASH" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
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
    </div>
  );
}
