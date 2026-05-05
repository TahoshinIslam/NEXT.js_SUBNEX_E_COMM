import Link from "next/link";
import { formatCurrency, getInitials } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface TopClient {
  id: string;
  name: string;
  email: string | null;
  totalPaid: number;
  subscriptionCount: number;
}

interface TopClientsTableProps {
  clients: TopClient[];
}

export function TopClientsTable({ clients }: TopClientsTableProps) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Top Clients</h3>
          <p className="text-xs text-muted-foreground mt-0.5">By total revenue</p>
        </div>
        <Link href="/clients" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">No clients yet</p>
      ) : (
        <div className="space-y-2">
          {clients.map((client, i) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {getInitials(client.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.subscriptionCount} subs</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-emerald-400 shrink-0">
                {formatCurrency(client.totalPaid)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
