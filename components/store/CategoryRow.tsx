"use client";

import { Bot, PlaySquare, Palette, Music, ShieldCheck, Zap, Gamepad2, ShoppingBag } from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils";

const CATEGORIES = [
  { id: "ALL", label: "All Subscriptions", icon: ShoppingBag },
  { id: "AI", label: "AI Tools", icon: Bot },
  { id: "STREAMING", label: "Streaming", icon: PlaySquare },
  { id: "EDITING", label: "Design & Editing", icon: Palette },
  { id: "MUSIC", label: "Music", icon: Music },
  { id: "SECURITY", label: "VPN & Security", icon: ShieldCheck },
  { id: "PRODUCTIVITY", label: "Productivity", icon: Zap },
  { id: "GAMING", label: "Gaming", icon: Gamepad2 },
];

interface CategoryRowProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryRow({ activeCategory, onSelectCategory }: CategoryRowProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-white mb-4">Shop by Category</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl whitespace-nowrap snap-start transition-all border ${
                isActive
                  ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-white/[0.03] text-white/60 border-white/[0.08] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <cat.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
