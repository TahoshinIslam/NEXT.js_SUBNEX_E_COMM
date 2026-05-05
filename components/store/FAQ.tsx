"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How is this cheaper than the official price?",
    a: "We source subscriptions in bulk from official regional pricing tiers and family plans, allowing us to pass significant savings on to you while keeping the accounts completely legitimate.",
  },
  {
    q: "Is this safe and legal?",
    a: "Yes. All accounts are created legally and paid for. We do not use cracked, hacked, or stolen accounts. Your subscription will work exactly like a regular account.",
  },
  {
    q: "How will I receive my subscription?",
    a: "Once your payment is verified, we will send the account credentials or activation link to your email/WhatsApp within 24 hours (usually much faster).",
  },
  {
    q: "What if I have a problem after purchase?",
    a: "We provide dedicated support for the entire duration of your subscription. If an account stops working, we will fix it or replace it free of charge.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We currently accept bKash, Nagad, and major credit/debit cards via our secure payment gateway.",
  },
  {
    q: "Can I get a refund?",
    a: "If we are unable to deliver your subscription within 48 hours, or if we cannot fix a non-working account, you are entitled to a full refund for the remaining duration.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-4 py-20 border-t border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Got Questions? We've Got Answers.</h2>
        <p className="text-white/40">Everything you need to know about our service.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className={cn(
                "border rounded-2xl overflow-hidden transition-colors duration-300",
                isOpen ? "bg-white/[0.03] border-white/10" : "bg-transparent border-white/[0.05] hover:border-white/10"
              )}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={cn("w-5 h-5 text-white/30 transition-transform duration-300 shrink-0", isOpen && "rotate-180")}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-40" : "max-h-0"
                )}
              >
                <p className="p-5 pt-0 text-sm text-white/50 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
