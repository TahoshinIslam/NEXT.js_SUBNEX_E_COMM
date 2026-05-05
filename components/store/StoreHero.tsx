"use client";

import { CheckCircle2, Package, Lock, MessageCircle } from "lucide-react";
import GradientText from "@/components/ui/GradientText";

export function StoreHero({ orgName }: { orgName: string }) {
  const benefits = [
    { icon: "CheckCircle2", text: "Instant order confirmation" },
    { icon: "Package", text: "24h delivery" },
    { icon: "Lock", text: "Secure checkout" },
    { icon: "MessageCircle", text: "WhatsApp support" },
  ];
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#3b82f6]/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
          Premium Subscriptions · Fast Delivery
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
          Get Any Subscription
          <br />
          <GradientText
            colors={["#3b82f6", "#8b5cf6", "#3b82f6"]}
            animationSpeed={4}
            showBorder={false}
          >
            At the Best Price
          </GradientText>
        </h1>

        <p className="text-white/40 text-lg max-w-xl mx-auto mb-8">
          ChatGPT, Netflix, Adobe, and more — browse, pick your plan, checkout in 60 seconds.
          Delivery within 24 hours.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant order confirmation</div>
          <div className="flex items-center gap-1.5"><Package className="w-4 h-4 text-[#3b82f6]" /> 24h delivery</div>
          <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-amber-400" /> Secure checkout</div>
          <div className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp support</div>
        </div>
      </div>
    </section>
  );
}
