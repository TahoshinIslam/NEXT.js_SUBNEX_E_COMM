import { getPortalAccount } from "@/lib/portal-auth";
import Link from "next/link";
import { ShoppingBag, Package, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { formatDate, formatDateTime, formatCurrency, cn } from "@/lib/utils";

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

const STATUS_DESC: Record<string, string> = {
  PENDING: "We received your order and will confirm it shortly.",
  CONFIRMED: "Order confirmed! We're preparing your credentials.",
  FULFILLED: "Done! Your credentials have been sent to your email.",
  CANCELLED: "This order was cancelled.",
};

export default async function PortalOrdersPage() {
  const account = await getPortalAccount();
  if (!account) return null;
  const orders = account.client.orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Orders</h1>
        <p className="text-white/40 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl py-20 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-white/15" />
          <h2 className="text-lg font-bold text-white mb-2">No orders yet</h2>
          <p className="text-white/30 text-sm mb-6">Browse the store and place your first order</p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#2563eb] transition-colors"
          >
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const Icon = STATUS_ICONS[order.status];
            return (
              <div
                key={order.id}
                className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden"
              >
                {/* Order header */}
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                    <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", STATUS_STYLES[order.status])}>
                      <Icon className="w-3 h-3" />
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-xs text-white/30 mt-0.5">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>

                {/* Status description */}
                <div className="px-5 py-3 bg-white/[0.015] border-b border-white/[0.04]">
                  <p className="text-sm text-white/50">{STATUS_DESC[order.status]}</p>
                </div>

                {/* Order items */}
                <div className="px-5 py-4 space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 text-white/40" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.serviceName}</p>
                          <p className="text-xs text-white/30">{item.duration} days × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white/70">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                {order.customerNote && (
                  <div className="px-5 py-3 border-t border-white/[0.04]">
                    <p className="text-xs text-white/30">Note: {order.customerNote}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
