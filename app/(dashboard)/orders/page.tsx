"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag, Clock, CheckCircle, XCircle,
  Package, ChevronDown, ChevronRight, RefreshCw,
} from "lucide-react";
import { formatDate, formatDateTime, formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "FULFILLED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CONFIRMED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  FULFILLED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  CANCELLED: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: RefreshCw,
  FULFILLED: CheckCircle,
  CANCELLED: XCircle,
};

async function fetchOrders(status: string, page: number) {
  const params = new URLSearchParams({
    ...(status !== "ALL" ? { status } : {}),
    page: String(page),
    pageSize: "20",
  });
  const res = await fetch(`/api/orders?${params}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function OrdersPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", status, page],
    queryFn: () => fetchOrders(status, page),
  });

const updateStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: async (data, vars) => {
      if (vars.newStatus === "FULFILLED" && data?.data?.subscriptionsCreated) {
        toast({ title: `Order fulfilled! ${data.data.subscriptionsCreated} subscription(s) created` });
      } else {
        toast({ title: `Order marked as ${vars.newStatus.toLowerCase()}` });
      }
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Incoming orders from the storefront · {data?.total ?? 0} total
        </p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pending", status: "PENDING", color: "text-amber-400" },
          { label: "Confirmed", status: "CONFIRMED", color: "text-blue-400" },
          { label: "Fulfilled", status: "FULFILLED", color: "text-emerald-400" },
          { label: "Cancelled", status: "CANCELLED", color: "text-slate-400" },
        ].map((s) => {
          const Icon = STATUS_ICONS[s.status];
          const count = orders.filter((o: any) => o.status === s.status).length;
          return (
            <button
              key={s.status}
              onClick={() => { setStatus(s.status); setPage(1); }}
              className={cn(
                "stat-card text-left transition-all hover:border-white/20",
                status === s.status && "border-primary/30"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <p className={cn("text-2xl font-bold", s.color)}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setStatus(t); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              status === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted/30 rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted/20 rounded w-1/2" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="glass rounded-xl py-16 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          orders.map((order: any) => {
            const isOpen = expanded === order.id;
            const Icon = STATUS_ICONS[order.status];
            return (
              <div key={order.id} className="glass rounded-xl overflow-hidden">
                {/* Order header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                    <span className="font-mono font-bold text-sm text-primary">{order.orderNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail} · {order.customerPhone}</p>
                  </div>

                  <div className="hidden md:block text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-semibold text-emerald-400 text-sm">{formatCurrency(order.totalAmount)}</p>
                    <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border", STATUS_STYLES[order.status])}>
                      <Icon className="w-3 h-3" />
                      {order.status}
                    </span>
                  </div>
                </button>

                {/* Expanded order detail */}
                {isOpen && (
                  <div className="border-t border-border px-5 py-5 space-y-5">
                    {/* Items */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Order Items</p>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-accent/30">
                            <div className="flex items-center gap-3">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{item.serviceName}</p>
                                <p className="text-xs text-muted-foreground">{item.duration} days × {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-emerald-400 text-sm">
                              {formatCurrency(Number(item.price) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    {order.customerNote && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer Note</p>
                        <p className="text-sm text-muted-foreground bg-accent/20 rounded-lg px-3 py-2">{order.customerNote}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {order.status === "PENDING" && (
                        <>
                          <ActionBtn
                            onClick={() => updateStatus.mutate({ id: order.id, newStatus: "CONFIRMED" })}
                            color="blue"
                            icon={RefreshCw}
                            label="Confirm Order"
                            loading={updateStatus.isPending}
                          />
                          <ActionBtn
                            onClick={() => updateStatus.mutate({ id: order.id, newStatus: "CANCELLED" })}
                            color="red"
                            icon={XCircle}
                            label="Cancel"
                            loading={updateStatus.isPending}
                          />
                        </>
                      )}
                      {order.status === "CONFIRMED" && (
                        <ActionBtn
                          onClick={() => updateStatus.mutate({ id: order.id, newStatus: "FULFILLED" })}
                          color="emerald"
                          icon={CheckCircle}
                          label="Mark Fulfilled"
                          loading={updateStatus.isPending}
                        />
                      )}
                      {order.status === "FULFILLED" && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Order complete
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  );
}

function ActionBtn({ onClick, color, icon: Icon, label, loading }: {
  onClick: () => void; color: string; icon: any; label: string; loading: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-400/10 text-blue-400 border-blue-400/20 hover:bg-blue-400/20",
    emerald: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/20",
    red: "bg-red-400/10 text-red-400 border-red-400/20 hover:bg-red-400/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50", colors[color])}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
