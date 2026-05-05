import { auth } from "@/lib/auth";
import { getDashboardStats, getRevenueByMonth, getSubscriptionsByCategory, getTopClients } from "@/services/analytics.service";
import { getExpiringSoon } from "@/services/subscription.service";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { ExpiringTable } from "@/components/dashboard/ExpiringTable";
import { TopClientsTable } from "@/components/dashboard/TopClientsTable";
import { formatCurrency } from "@/lib/utils";
import {
  Users, Package, AlertTriangle, TrendingUp,
  DollarSign, Clock, BarChart3, XCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session!.user.orgId;

  const [stats, revenue, categories, topClients, expiring] = await Promise.all([
    getDashboardStats(orgId),
    getRevenueByMonth(orgId, 6),
    getSubscriptionsByCategory(orgId),
    getTopClients(orgId, 5),
    getExpiringSoon(orgId, 7),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your subscription business</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={Package}
          color="emerald"
        />
        <KPICard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={AlertTriangle}
          color="amber"
          urgent={stats.expiringSoon > 0}
        />
        <KPICard
          title="Expired"
          value={stats.expiredCount}
          icon={XCircle}
          color="red"
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="This Month"
          value={formatCurrency(stats.revenueThisMonth)}
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="MRR"
          value={formatCurrency(stats.mrr)}
          icon={BarChart3}
          color="violet"
        />
        <KPICard
          title="Due Payments"
          value={formatCurrency(stats.pendingPayments)}
          icon={Clock}
          color="red"
          urgent={stats.pendingPayments > 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>
        <div>
          <CategoryChart data={categories} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpiringTable subscriptions={expiring} />
        <TopClientsTable clients={topClients} />
      </div>
    </div>
  );
}
