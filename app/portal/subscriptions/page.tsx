import { getPortalAccount } from "@/lib/portal-auth";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import {
  formatDate, daysUntilExpiry, getStatusColor,
  getStatusLabel, getCategoryEmoji, formatCurrency, cn,
} from "@/lib/utils";

export default async function PortalSubscriptionsPage() {
  const account = await getPortalAccount();
  if (!account) return null;
  const subscriptions = account.client.subscriptions;

  const active = subscriptions.filter((s) => ["ACTIVE", "EXPIRING_SOON"].includes(s.status));
  const expired = subscriptions.filter((s) => ["EXPIRED", "CANCELLED"].includes(s.status));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">My Subscriptions</h1>
        <p className="text-white/40 text-sm mt-1">
          {active.length} active · {expired.length} expired
        </p>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <section>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {active.map((sub) => {
              const days = daysUntilExpiry(sub.expiryDate);
              const pct = Math.max(0, Math.min(100, (days / sub.durationDays) * 100));
              return (
                <div key={sub.id} className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl">
                        {getCategoryEmoji(sub.service.category)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{sub.service.name}</p>
                        <p className="text-xs text-white/30 mt-0.5">{sub.service.category}</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", getStatusColor(sub.status))}>
                      {getStatusLabel(sub.status)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/30">Time remaining</span>
                      <span className={cn("font-medium", days <= 3 ? "text-amber-400" : "text-white/60")}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Expires today!" : `${days} days`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", days <= 3 ? "bg-amber-400" : "bg-[#3b82f6]")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-white/30">Started</p>
                      <p className="text-white/70 mt-0.5">{formatDate(sub.purchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-white/30">Expires</p>
                      <p className="text-white/70 mt-0.5">{formatDate(sub.expiryDate)}</p>
                    </div>
                  </div>

                  {days <= 5 && (
                    <Link
                      href="/store"
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#3b82f6]/30 text-[#3b82f6] text-sm font-medium hover:bg-[#3b82f6]/10 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Renew Subscription
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <section>
          <h2 className="font-bold text-white/50 mb-4 text-sm uppercase tracking-wider">Expired / Cancelled</h2>
          <div className="space-y-2">
            {expired.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-4 px-4 py-3.5 bg-white/[0.01] border border-white/[0.05] rounded-xl opacity-60"
              >
                <span className="text-xl">{getCategoryEmoji(sub.service.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/70 truncate">{sub.service.name}</p>
                  <p className="text-xs text-white/30">Expired {formatDate(sub.expiryDate)}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getStatusColor(sub.status))}>
                  {getStatusLabel(sub.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {subscriptions.length === 0 && (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl py-20 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-white/15" />
          <h2 className="text-lg font-bold text-white mb-2">No subscriptions yet</h2>
          <p className="text-white/30 text-sm mb-6">
            Place an order and your subscriptions will appear here after fulfillment
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#2563eb] transition-colors"
          >
            Browse Store
          </Link>
        </div>
      )}
    </div>
  );
}
