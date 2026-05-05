"use client";

import { useState } from "react";
import { ShoppingCart, Check, ChevronDown, Star, Zap } from "lucide-react";
import { useCart } from "./CartProvider";
import { getCategoryIcon, getCategoryColor, formatCurrency, cn } from "@/lib/utils";

const DURATION_TIERS = [
  { label: "1 Month", days: 30, multiplier: 1 },
  { label: "3 Months", days: 90, multiplier: 2.7 },
  { label: "6 Months", days: 180, multiplier: 5 },
  { label: "1 Year", days: 365, multiplier: 9.5 },
];

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
  basePrice?: number;
}

interface ServiceCardProps {
  service: Service;
  isFeatured?: boolean;
}

const CATEGORY_BASE_PRICES: Record<string, number> = {
  AI: 350,
  STREAMING: 250,
  EDITING: 600,
  PRODUCTIVITY: 300,
  CLOUD: 400,
  OTHER: 250,
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = getCategoryIcon(service.category);
  const { addItem, hasItem, removeItem } = useCart();
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [showTiers, setShowTiers] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const baseMonthly = service.basePrice ?? CATEGORY_BASE_PRICES[service.category] ?? 300;
  const tier = DURATION_TIERS[selectedTierIdx];
  const price = Math.round(baseMonthly * tier.multiplier);
  const originalPrice = Math.round(price * 1.4);
  const isInCart = hasItem(service.id, tier.days);

  function handleAdd() {
    if (isInCart) {
      removeItem(service.id, tier.days);
      return;
    }
    addItem({
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      duration: tier.days,
      price,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  const savings =
    selectedTierIdx > 0
      ? Math.round(100 - (price / (baseMonthly * (tier.days / 30))) * 100)
      : 0;

  return (
    <div className="group relative bg-white/[0.02] border border-white/[0.07] rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border bg-white/[0.04] border-white/[0.08] flex items-center justify-center shrink-0">
          {service.iconUrl ? (
            <img src={service.iconUrl} alt={service.name} className="w-7 h-7 object-contain" />
          ) : (
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-[15px] sm:text-base leading-tight truncate" title={service.name}>
              {service.name}
            </h3>
            {savings > 0 && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold leading-none">
                -{savings}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={cn("text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md", getCategoryColor(service.category))}>
              {service.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-white/50">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" fill="currentColor" />
              4.8
              <span className="hidden sm:inline">(120)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description — hidden on small screens to keep card tight */}
      {service.description && (
        <p className="hidden sm:block text-sm text-white/35 leading-relaxed line-clamp-2">
          {service.description}
        </p>
      )}

      {/* Duration selector */}
      <div className="relative">
        <button
          onClick={() => setShowTiers(!showTiers)}
          className="w-full flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-colors text-sm"
        >
          <span className="text-white font-medium">{tier.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs sm:text-sm">{formatCurrency(price)}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-white/30 transition-transform", showTiers && "rotate-180")} />
          </div>
        </button>

        {showTiers && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f1419] border border-white/[0.1] rounded-xl overflow-hidden z-20 shadow-2xl">
            {DURATION_TIERS.map((t, idx) => {
              const tierPrice = Math.round(baseMonthly * t.multiplier);
              const tierSavings = idx > 0 ? Math.round(100 - (tierPrice / (baseMonthly * (t.days / 30))) * 100) : 0;
              return (
                <button
                  key={t.days}
                  onClick={() => { setSelectedTierIdx(idx); setShowTiers(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 text-sm hover:bg-white/[0.05] transition-colors",
                    idx === selectedTierIdx ? "bg-[#3b82f6]/10 text-[#3b82f6]" : "text-white/70"
                  )}
                >
                  <span className="font-medium">{t.label}</span>
                  <div className="flex items-center gap-2">
                    {tierSavings > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400">-{tierSavings}%</span>
                    )}
                    <span className={idx === selectedTierIdx ? "text-[#3b82f6]" : "text-white/50"}>
                      {formatCurrency(tierPrice)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="pt-3 sm:pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-white/40 text-xs sm:text-sm line-through decoration-white/20">
            {formatCurrency(originalPrice)}
          </span>
          <span className="text-emerald-400 text-[10px] sm:text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Save {formatCurrency(originalPrice - price)}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-white">{formatCurrency(price)}</span>
          <span className="text-white/30 text-xs sm:text-sm">/ {tier.label.toLowerCase()}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/40 mt-2 sm:mt-3 font-medium">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" fill="currentColor" />
          Delivery within 24 hrs
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleAdd}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
            isInCart
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
              : justAdded
              ? "bg-emerald-500 text-white"
              : "bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-[0.98]"
          )}
        >
          {isInCart ? (
            <>
              <Check className="w-4 h-4" />
              In Cart
            </>
          ) : justAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add
            </>
          )}
        </button>
        <button className="hidden sm:block px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors text-sm font-medium">
          Details
        </button>
      </div>
    </div>
  );
}
