"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { RevenueByMonth } from "@/types";

interface RevenueChartProps {
  data: RevenueByMonth[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-blue-400">৳{payload[0]?.value?.toLocaleString()}</p>
      <p className="text-muted-foreground text-xs">{payload[1]?.value} subs</p>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-sm">Revenue Overview</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
