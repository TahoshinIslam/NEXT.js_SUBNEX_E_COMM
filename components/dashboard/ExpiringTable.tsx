import Link from "next/link";
import type { SubscriptionWithRelations } from "@/types";
import { formatDate, daysUntilExpiry, getStatusColor, getStatusLabel, getCategoryEmoji } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ExpiringTableProps {
  subscriptions: SubscriptionWithRelations[];
}

export function ExpiringTable({ subscriptions }: ExpiringTableProps) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Expiring Soon</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Next 7 days</p>
        </div>
        <Link href="/renewals" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          🎉 No expiring subscriptions
        </p>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub) => {
            const days = daysUntilExpiry(sub.expiryDate);
            return (
              <Link
                key={sub.id}
                href={`/subscriptions/${sub.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{getCategoryEmoji(sub.service.category)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sub.client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{sub.service.name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-medium">
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(sub.expiryDate)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
