import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "emerald" | "amber" | "red" | "violet";
  urgent?: boolean;
  subtitle?: string;
}

const colorMap = {
  blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  red: "text-red-400 bg-red-400/10 border-red-400/20",
  violet: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

export function KPICard({ title, value, icon: Icon, color, urgent, subtitle }: KPICardProps) {
  return (
    <div className={cn(
      "stat-card transition-all",
      urgent && "border-amber-400/30 shadow-amber-400/5 shadow-lg"
    )}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", colorMap[color])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
