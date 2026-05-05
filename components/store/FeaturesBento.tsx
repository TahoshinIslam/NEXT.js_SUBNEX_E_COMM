import { MagicCard } from "@/components/ui/MagicCard";
import { Zap, Lock, HeadphonesIcon, MonitorSmartphone } from "lucide-react";

export function FeaturesBento() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24 border-t border-white/5">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5227FF] to-purple-400">SubTrack?</span>
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          We provide a premium, hassle-free subscription experience with instant delivery and unmatched support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
        
        {/* Large Feature 1: Spans 2 columns */}
        <MagicCard className="md:col-span-2 flex flex-col justify-end p-8" gradientColor="#5227FF" gradientOpacity={0.2}>
          <div className="flex-1 flex items-center justify-center mb-8">
            <Zap className="w-24 h-24 text-white/20" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Instant Delivery</h3>
            <p className="text-white/60">
              Get access to your premium accounts the moment you purchase. No waiting, no delays. 
              Our automated system provisions your credentials within seconds.
            </p>
          </div>
        </MagicCard>

        {/* Small Feature 1 */}
        <MagicCard className="flex flex-col p-8" gradientColor="#22c55e" gradientOpacity={0.2}>
          <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-[#22c55e]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
          <p className="text-white/60 text-sm">
            We use bank-level encryption. Your data and account details are strictly confidential.
          </p>
        </MagicCard>

        {/* Small Feature 2 */}
        <MagicCard className="flex flex-col p-8" gradientColor="#3b82f6" gradientOpacity={0.2}>
          <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center mb-6">
            <MonitorSmartphone className="w-6 h-6 text-[#3b82f6]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Multi-Device</h3>
          <p className="text-white/60 text-sm">
            Stream or work from your phone, laptop, or TV. Our subscriptions support all platforms.
          </p>
        </MagicCard>

        {/* Large Feature 2: Spans 2 columns */}
        <MagicCard className="md:col-span-2 flex flex-col justify-end p-8" gradientColor="#a855f7" gradientOpacity={0.2}>
          <div className="absolute top-8 right-8">
            <HeadphonesIcon className="w-24 h-24 text-white/10" />
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-bold text-white mb-2">24/7 Priority Support</h3>
            <p className="text-white/60">
              Running into an issue? Our dedicated support team is online around the clock. 
              We guarantee a response time of under 1 hour for all active subscribers.
            </p>
          </div>
        </MagicCard>

      </div>
    </section>
  );
}
