"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function PortalRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError("");
    const res = await fetch("/api/portal/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Registration failed");
      return;
    }
    router.push("/portal/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/25 mb-2">
            <UserPlus className="w-6 h-6 text-[#3b82f6]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/40 text-sm">Track your orders and subscriptions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { field: "name", label: "Full Name", placeholder: "Rahim Khan", type: "text" },
            { field: "email", label: "Email Address", placeholder: "rahim@example.com", type: "email" },
            { field: "phone", label: "Phone (Optional)", placeholder: "01711-000000", type: "tel" },
            { field: "password", label: "Password", placeholder: "Min 6 characters", type: "password" },
            { field: "confirmPassword", label: "Confirm Password", placeholder: "Repeat password", type: "password" },
          ].map(({ field, label, placeholder, type }) => (
            <div key={field} className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
              <input
                {...register(field as any)}
                type={type}
                placeholder={placeholder}
                className={inputClass}
              />
              {(errors as any)[field] && (
                <p className="text-xs text-red-400">{(errors as any)[field]?.message}</p>
              )}
            </div>
          ))}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#2563eb] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-white/30">
          Already have an account?{" "}
          <Link href="/portal/login" className="text-[#3b82f6] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#3b82f6]/50 transition-colors";
