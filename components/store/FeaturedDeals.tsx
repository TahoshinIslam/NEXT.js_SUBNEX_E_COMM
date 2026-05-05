import { ServiceCard } from "./ServiceCard";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { Sparkles, Flame, Zap } from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
  basePrice?: number;
}

interface FeaturedDealsProps {
  services: Service[];
}

export function FeaturedDeals({ services }: FeaturedDealsProps) {
  // Find top deals based on popular keywords, fallback to first 4
  const featured = services
    .filter(s => 
      s.name.toLowerCase().includes("chatgpt") || 
      s.name.toLowerCase().includes("netflix") || 
      s.name.toLowerCase().includes("adobe") || 
      s.name.toLowerCase().includes("canva") ||
      s.name.toLowerCase().includes("spotify") ||
      s.name.toLowerCase().includes("youtube")
    )
    .slice(0, 4);

  // Fallback if DB doesn't have exact matches
  const displayServices = featured.length >= 4 ? featured : [...featured, ...services.filter(s => !featured.includes(s))].slice(0, 4);

  if (displayServices.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-transparent via-[#3b82f6]/[0.02] to-transparent border-y border-white/[0.02] py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#3b82f6]" /> Today's Top Deals
            </h2>
            <p className="text-white/40">Our most popular subscriptions at unbeatable prices.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {displayServices.map((service, i) => (
            <div key={service.id} className="relative">
              {i === 0 && (
                <div className="absolute -top-3 -right-3 z-10 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5" fill="currentColor" /> Hot Deal
                </div>
              )}
              {i === 1 && (
                <div className="absolute -top-3 -right-3 z-10 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" fill="currentColor" /> Best Seller
                </div>
              )}
              <ElectricBorder
                color="#7df9ff"
                speed={1}
                chaos={0.12}
                thickness={2}
                style={{ borderRadius: 16, display: "block", height: "100%" }}
              >
                <ServiceCard service={service} isFeatured={true} />
              </ElectricBorder>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
