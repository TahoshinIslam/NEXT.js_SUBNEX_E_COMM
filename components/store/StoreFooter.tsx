import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#080c10] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/store" className="flex items-center gap-2.5 inline-flex">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">SubTrack</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Your trusted platform for premium subscriptions at unbeatable prices. Fast, secure, and reliable.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link href="/store" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Browse</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white mb-4">Payment Methods</h4>
            <div className="flex gap-2 flex-wrap">
              {["Visa", "Mastercard", "bKash", "Nagad"].map((p) => (
                <div key={p} className="px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-white/60 font-medium">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} SubTrack Store. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
