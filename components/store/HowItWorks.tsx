import { Search, ShoppingCart, Inbox } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20 border-t border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Get Your Subscription in 3 Easy Steps</h2>
        <p className="text-white/40">No waiting. No complicated processes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting line (desktop only) */}
        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/70 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white">1. Browse & Pick</h3>
          <p className="text-sm text-white/50 max-w-[250px] mx-auto leading-relaxed">
            Search for the subscription you want and choose your preferred plan duration.
          </p>
        </div>

        <div className="relative text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white">2. Checkout in 60s</h3>
          <p className="text-sm text-white/50 max-w-[250px] mx-auto leading-relaxed">
            Pay securely via card, bKash, or Nagad. Your details are fully encrypted.
          </p>
        </div>

        <div className="relative text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white">3. Get Delivered</h3>
          <p className="text-sm text-white/50 max-w-[250px] mx-auto leading-relaxed">
            Receive your account credentials or activation details within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
