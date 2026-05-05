import type { Metadata } from "next";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartProvider } from "@/components/store/CartProvider";
import { StoreBackground } from "@/components/store/StoreBackground";

export const metadata: Metadata = {
  title: "SubTrack Store — Browse Subscriptions",
  description: "Get premium subscriptions at the best prices",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="relative min-h-screen bg-[#080c10]">
        <StoreBackground />
        <StoreHeader />
        <main>{children}</main>
      </div>
    </CartProvider>
  );
}
