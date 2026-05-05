"use client";

import { useState } from "react";
import { useCart } from "@/components/store/CartProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingBag, ArrowLeft, Loader2, CheckCircle,
  CreditCard, Banknote, Smartphone,
} from "lucide-react";
import { formatCurrency, getCategoryEmoji, cn } from "@/lib/utils";
import ElectricBorder from "@/components/ui/ElectricBorder";

const schema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CASH"]),
  note: z.string().optional(),
  // account creation fields
  createAccount: z.boolean(),
  password: z.string().min(6, "Min 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((d) => {
  if (d.createAccount && d.password !== d.confirmPassword) return false;
  return true;
}, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

const PAYMENT_METHODS = [
  { value: "BKASH", label: "bKash", icon: "📱", color: "border-pink-500/30 bg-pink-500/10 text-pink-400" },
  { value: "NAGAD", label: "Nagad", icon: "📱", color: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
  { value: "ROCKET", label: "Rocket", icon: "📱", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: "🏦", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  { value: "CASH", label: "Cash on Delivery", icon: "💵", color: "border-green-500/30 bg-green-500/10 text-green-400" },
];

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart();
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState<{ orderNumber: string; email: string } | null>(null);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { createAccount: true, paymentMethod: "BKASH" },
  });

  const selectedMethod = watch("paymentMethod");
  const createAccount = watch("createAccount");

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            note: data.note,
          },
          paymentMethod: data.paymentMethod,
          items: items.map((i) => ({
            serviceId: i.serviceId,
            serviceName: i.serviceName,
            duration: i.duration,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount: total,
          createAccount: data.createAccount,
          password: data.createAccount ? data.password : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Order failed");
      }

      const result = await res.json();
      clearCart();
      setOrderPlaced({ orderNumber: result.data.orderNumber, email: data.email });
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Empty cart guard
  if (count === 0 && !orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <h2 className="text-xl font-bold text-white mb-3">Your cart is empty</h2>
        <Link href="/store" className="text-[#3b82f6] hover:underline text-sm">← Back to store</Link>
      </div>
    );
  }

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Order Placed! 🎉</h1>
        <p className="text-white/50 mb-2">
          Order <span className="text-white font-mono font-bold">{orderPlaced.orderNumber}</span> confirmed.
        </p>
        <p className="text-white/40 text-sm mb-8">
          We'll send a confirmation to <span className="text-white">{orderPlaced.email}</span> and
          deliver your credentials within 24 hours.
        </p>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-left mb-8">
          <h3 className="text-white font-semibold mb-3 text-sm">What happens next?</h3>
          <ol className="space-y-2.5 text-sm text-white/50">
            <li className="flex gap-2.5"><span className="text-[#3b82f6] font-bold shrink-0">1.</span> We review your order and confirm payment</li>
            <li className="flex gap-2.5"><span className="text-[#3b82f6] font-bold shrink-0">2.</span> You receive credentials via email within 24h</li>
            <li className="flex gap-2.5"><span className="text-[#3b82f6] font-bold shrink-0">3.</span> Track your order anytime in your portal account</li>
          </ol>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/portal" className="px-6 py-3 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#2563eb] transition-colors">
            Go to My Account
          </Link>
          <Link href="/store" className="px-6 py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm hover:text-white transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/store/cart" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left col — form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Contact info */}
            <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-black flex items-center justify-center">1</span>
                Your Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" error={errors.name?.message}>
                  <input {...register("name")} placeholder="Rahim Khan" className={inputClass} />
                </Field>
                <Field label="Email Address *" error={errors.email?.message}>
                  <input {...register("email")} type="email" placeholder="rahim@example.com" className={inputClass} />
                </Field>
                <Field label="Phone Number *" error={errors.phone?.message} className="sm:col-span-2">
                  <input {...register("phone")} placeholder="01711-000000" className={inputClass} />
                </Field>
                <Field label="Order Note" error={undefined} className="sm:col-span-2">
                  <textarea
                    {...register("note")}
                    rows={2}
                    placeholder="Any special instructions..."
                    className={cn(inputClass, "resize-none")}
                  />
                </Field>
              </div>
            </section>

            {/* Payment method */}
            <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-black flex items-center justify-center">2</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setValue("paymentMethod", method.value as any)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border text-sm font-medium transition-all",
                      selectedMethod === method.value
                        ? method.color + " scale-[1.02]"
                        : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/70"
                    )}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Payment instructions */}
              {selectedMethod !== "CASH" && (
                <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/50">
                  <p className="font-medium text-white/70 mb-1">How to pay:</p>
                  <p>
                    After placing your order, we'll send payment details to your email.
                    Send the total amount to our {selectedMethod} number and include your order number as reference.
                  </p>
                </div>
              )}
            </section>

            {/* Create account */}
            <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-bold text-white mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-black flex items-center justify-center">3</span>
                Create Account
                <span className="text-xs font-normal text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded-full border border-[#3b82f6]/20">Recommended</span>
              </h2>
              <p className="text-white/35 text-sm mb-4 ml-8">Track your orders and subscriptions anytime</p>

              <label className="flex items-center gap-3 cursor-pointer mb-4 ml-8">
                <div
                  onClick={() => setValue("createAccount", !createAccount)}
                  className={cn(
                    "w-11 h-6 rounded-full border-2 transition-all relative cursor-pointer",
                    createAccount ? "bg-[#3b82f6] border-[#3b82f6]" : "bg-white/10 border-white/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    createAccount ? "left-5" : "left-0.5"
                  )} />
                </div>
                <span className="text-sm text-white/70">Yes, create my account</span>
              </label>

              {createAccount && (
                <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Password *" error={errors.password?.message}>
                    <input {...register("password")} type="password" placeholder="Min 6 characters" className={inputClass} />
                  </Field>
                  <Field label="Confirm Password *" error={errors.confirmPassword?.message}>
                    <input {...register("confirmPassword")} type="password" placeholder="Repeat password" className={inputClass} />
                  </Field>
                </div>
              )}
            </section>
          </div>

          {/* Right col — order summary */}
          <div className="lg:col-span-2">
            <ElectricBorder
              className="sticky top-24 block"
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
            <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2028] via-[#10151b] to-[#0a0d12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_60px_rgba(125,249,255,0.04)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top,rgba(125,249,255,0.08),transparent_60%)] p-6">
              <h2 className="font-bold text-white mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={`${item.serviceId}-${item.duration}`} className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{getCategoryEmoji(item.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{item.serviceName}</p>
                      <p className="text-xs text-white/35">{item.duration}d × {item.quantity}</p>
                    </div>
                    <p className="text-sm text-white/70 font-medium shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.08] pt-4 mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white/70">{formatCurrency(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Delivery</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex items-center justify-between font-bold text-lg pt-1">
                  <span className="text-white">Total</span>
                  <span className="text-[#3b82f6]">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#3b82f6] text-white font-bold text-base hover:bg-[#2563eb] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order · {formatCurrency(total)}</>
                )}
              </button>

              <p className="text-xs text-white/25 text-center mt-3">
                By ordering you agree to our terms of service
              </p>
            </div>
            </ElectricBorder>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#3b82f6]/50 focus:bg-white/[0.06] transition-colors";

function Field({
  label, error, children, className,
}: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
