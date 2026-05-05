"use client";

import LogoLoop from "@/components/ui/LogoLoop";
import { SiOpenai, SiNetflix, SiSpotify, SiYoutube, SiTwitch, SiCanva, SiApple, SiGoogle } from "react-icons/si";

// Using Anthropic logo for Claude isn't in standard react-icons easily recognizable without a specific version, 
// so we can use a custom text node or standard SVG if needed. For now, we'll use SiOpenai, Netflix, etc.
// Let's create a custom Claude text node
const ClaudeLogo = () => <span className="font-serif font-bold tracking-tighter text-amber-100/80">Claude</span>;
const ChatGptLogo = () => (
  <div className="flex items-center gap-2">
    <SiOpenai /> <span className="font-semibold">ChatGPT</span>
  </div>
);

const serviceLogos = [
  { node: <ChatGptLogo />, title: "ChatGPT", href: "#" },
  { node: <ClaudeLogo />, title: "Claude", href: "#" },
  { node: <div className="flex items-center gap-2"><SiNetflix className="text-[#E50914]" /><span className="font-bold tracking-tight">NETFLIX</span></div>, title: "Netflix", href: "#" },
  { node: <div className="flex items-center gap-2"><SiSpotify className="text-[#1DB954]" /><span className="font-bold tracking-tight">Spotify</span></div>, title: "Spotify", href: "#" },
  { node: <div className="flex items-center gap-2"><SiYoutube className="text-[#FF0000]" /><span className="font-bold tracking-tight">YouTube</span></div>, title: "YouTube", href: "#" },
  { node: <div className="flex items-center gap-2"><SiTwitch className="text-[#9146FF]" /><span className="font-bold tracking-tight">Twitch</span></div>, title: "Twitch", href: "#" },
  { node: <div className="flex items-center gap-2"><SiCanva className="text-[#00C4CC]" /><span className="font-bold tracking-tight">Canva</span></div>, title: "Canva", href: "#" },
  { node: <div className="flex items-center gap-2"><SiApple className="text-white/80" /><span className="font-bold tracking-tight">Apple</span></div>, title: "Apple", href: "#" },
  { node: <div className="flex items-center gap-2"><SiGoogle className="text-white/80" /><span className="font-bold tracking-tight">Google</span></div>, title: "Google", href: "#" },
];

export function TrustBadges() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 border-t border-white/5 overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-lg font-medium text-white/40 mb-3 tracking-widest uppercase">Trusted Brands We Provide</h2>
      </div>

      <div style={{ height: '80px', position: 'relative', overflow: 'hidden' }}>
        <LogoLoop
          logos={serviceLogos}
          speed={40}
          direction="left"
          logoHeight={32}
          gap={80}
          hoverSpeed={0}
          scaleOnHover={true}
          fadeOut={true}
          fadeOutColor="#000000" // Standard dark background fade
          ariaLabel="Service logos"
        />
      </div>
    </section>
  );
}
