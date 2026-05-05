"use client";

import { useCart } from "@/components/store/CartProvider";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { formatCurrency, getCategoryEmoji } from "@/lib/utils";
import ElectricBorder from "@/components/ui/ElectricBorder";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-white/40 mb-8">Browse our services and add something to get started.</p>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3b82f6] text-white font-semibold hover:bg-[#2563eb] transition-colors"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold thunder-text mb-2 inline-block">Your Cart</h1>
      <p className="text-white/40 mb-10">{count} item{count !== 1 ? "s" : ""}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <ElectricBorder
            className="block"
            color="#7df9ff"
            speed={1}
            chaos={0.12}
            thickness={2}
            style={{ borderRadius: 16 }}
          >
          <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2028] via-[#10151b] to-[#0a0d12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_60px_rgba(125,249,255,0.04)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top,rgba(125,249,255,0.08),transparent_60%)] p-4 sm:p-5 space-y-3">
          {items.map((item) => (
            <div
              key={`${item.serviceId}-${item.duration}`}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                {getCategoryEmoji(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{item.serviceName}</p>
                <p className="text-sm text-white/40 mt-0.5">{item.duration} days</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.duration, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.duration, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <p className="w-20 text-right font-semibold text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>

                <button
                  onClick={() => removeItem(item.serviceId, item.duration)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          </div>
          </ElectricBorder>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <ElectricBorder
            className="sticky top-24 block"
            color="#7df9ff"
            speed={1}
            chaos={0.12}
            thickness={2}
            style={{ borderRadius: 16 }}
          >
          <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2028] via-[#10151b] to-[#0a0d12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_60px_rgba(125,249,255,0.04)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top,rgba(125,249,255,0.08),transparent_60%)] p-6">
            <h3 className="font-bold thunder-text text-lg mb-5 relative z-10">Order Summary</h3>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={`${item.serviceId}-${item.duration}`} className="flex items-center justify-between text-sm">
                  <span className="text-white/50">{item.serviceName} ×{item.quantity}</span>
                  <span className="text-white/80">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-[#3b82f6]">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-white/30 mt-1">Payment collected on delivery</p>
            </div>

            <Link
              href="/store/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#3b82f6] text-white font-semibold hover:bg-[#2563eb] transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/store"
              className="w-full flex items-center justify-center mt-3 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
          </ElectricBorder>
        </div>
      </div>
    </div>
  );
}
