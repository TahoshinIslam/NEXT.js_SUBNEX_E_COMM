"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { SubscriptionsByCategory } from "@/types";
import { getCategoryEmoji } from "@/lib/utils";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6b7280"];

interface CategoryChartProps {
  data: SubscriptionsByCategory[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((d) => ({
    name: `${getCategoryEmoji(d.category)} ${d.category}`,
    value: d.count,
  }));

  if (!data.length) {
    return (
      <div className="glass rounded-xl p-5 flex items-center justify-center h-full min-h-[280px]">
        <p className="text-muted-foreground text-sm">No active subscriptions</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-sm">By Category</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Active subscriptions</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 11, color: "#9ca3af" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
