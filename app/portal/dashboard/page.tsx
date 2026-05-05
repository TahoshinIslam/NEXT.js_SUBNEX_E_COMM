import { getPortalAccount } from "@/lib/portal-auth";
import Link from "next/link";
import {
  ShoppingBag, Package, Clock, CheckCircle,
  ArrowRight, AlertTriangle,
} from "lucide-react";
import {
  formatDate, formatCurrency, daysUntilExpiry,
  getStatusColor, getStatusLabel, getCategoryEmoji, cn,
} from "@/lib/utils";

export default async function PortalDashboardPage() {
  const account = await getPortalAccount();
  if (!account) {
    return null;
  }
  const client = account.client;

  const activeOrders = client.orders.filter((o) =>
    ["PENDING", "CONFIRMED"].includes(o.status)
  );
  const activeSubscriptions = client.subscriptions.filter((s) =>
    ["ACTIVE", "EXPIRING_SOON"].includes(s.status)
  );
  const expiringIn3Days = activeSubscriptions.filter(
    (s) => daysUntilExpiry(s.expiryDate) <= 3
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Welcome back, {account.name.split(" ")[0]} 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">{account.email}</p>
      </div>

      {/* Expiry alert */}
      {expiringIn3Days.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold text-sm">
              {expiringIn3Days.length} subscription{expiringIn3Days.length !== 1 ? "s" : ""} expiring soon
            </p>
            <p className="text-amber-400/60 text-xs mt-0.5">
              {expiringIn3Days.map((s) => s.service.name).join(", ")} — contact us to renew
            </p>
          </div>
          <Link href="/portal/subscriptions" className="ml-auto text-amber-400 hover:underline text-xs shrink-0">
            View →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Subscriptions", value: activeSubscriptions.length, color: "text-emerald-400", icon: Package },
          { label: "Pending Orders", value: activeOrders.length, color: "text-amber-400", icon: Clock },
          { label: "Total Orders", value: client.orders.length, color: "text-blue-400", icon: ShoppingBag },
          { label: "Expiring Soon", value: expiringIn3Days.length, color: "text-red-400", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/30 uppercase tracking-wider leading-tight">{label}</p>
              <Icon className={cn("w-4 h-4 shrink-0", color)} />
            </div>
            <p className={cn("text-2xl font-black", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Recent Orders</h2>
          <Link href="/portal/orders" className="text-xs text-[#3b82f6] hover:underline flex items-center gap-1">
            All orders <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {client.orders.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl py-12 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-white/15" />
            <p className="text-white/30 text-sm">No orders yet</p>
            <Link href="/store" className="inline-block mt-3 text-[#3b82f6] text-sm hover:underline">
              Browse the store →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {client.orders.slice(0, 5).map((order) => {
              const statusStyles: Record<string, string> = {
                PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
                CONFIRMED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
                FULFILLED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                CANCELLED: "text-slate-400 bg-slate-400/10 border-slate-400/20",
              };
              return (
                <Link
                  key={order.id}
                  href="/portal/orders"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-sm text-white">{order.orderNumber}</p>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", statusStyles[order.status])}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400 shrink-0">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Active subscriptions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Active Subscriptions</h2>
          <Link href="/portal/subscriptions" className="text-xs text-[#3b82f6] hover:underline flex items-center gap-1">
            All subs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl py-12 text-center">
            <Package className="w-8 h-8 mx-auto mb-3 text-white/15" />
            <p className="text-white/30 text-sm">No active subscriptions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSubscriptions.slice(0, 4).map((sub) => {
              const days = daysUntilExpiry(sub.expiryDate);
              return (
                <div
                  key={sub.id}
                  className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getCategoryEmoji(sub.service.category)}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{sub.service.name}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getStatusColor(sub.status))}>
                        {getStatusLabel(sub.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">Expires</span>
                    <div className="text-right">
                      <p className="text-white/70">{formatDate(sub.expiryDate)}</p>
                      <p className={cn("font-medium", days <= 3 ? "text-amber-400" : "text-white/40")}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
