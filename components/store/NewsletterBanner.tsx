"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-background to-purple-600/10 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          Get exclusive deals before anyone else.
        </h2>
        <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
          Subscribe to our newsletter and save up to 40% on your first order. No spam, only the best offers.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:border-[#3b82f6]/50 focus:bg-white/[0.05] transition-all"
            required
          />
          <button
            type="submit"
            disabled={status !== "idle"}
            className="px-8 py-4 rounded-xl bg-[#3b82f6] text-white font-bold hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : status === "success" ? (
              "Subscribed!"
            ) : (
              <>
                Subscribe <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
