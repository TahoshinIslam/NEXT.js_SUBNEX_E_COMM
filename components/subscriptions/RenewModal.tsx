"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { addDays, format } from "date-fns";

const schema = z.object({
  durationDays: z.coerce.number().int().min(1).max(3650),
  salePrice: z.coerce.number().min(0),
});
type FormData = z.infer<typeof schema>;

const PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

interface RenewModalProps {
  subscription: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function RenewModal({ subscription, onClose, onSuccess }: RenewModalProps) {
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      durationDays: subscription.durationDays,
      salePrice: Number(subscription.salePrice),
    },
  });

  const durationDays = watch("durationDays");
  const baseDate = new Date(subscription.expiryDate) > new Date()
    ? new Date(subscription.expiryDate)
    : new Date();
  const newExpiry = addDays(baseDate, Number(durationDays) || 0);

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      toast({ title: "Subscription renewed!", description: `New expiry: ${formatDate(newExpiry)}` });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Renew Subscription</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 py-4 bg-accent/30 border-b border-border">
          <p className="text-sm font-medium">{subscription.service?.name}</p>
          <p className="text-xs text-muted-foreground">{subscription.client?.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Current expiry: <span className="text-foreground">{formatDate(subscription.expiryDate)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">Duration</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setValue("durationDays", p.days)}
                  className={`px-3 py-1 rounded-md text-xs border transition-colors ${watch("durationDays") === p.days ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input {...register("durationDays")} type="number" placeholder="Days" className={inputClass} />
            {errors.durationDays && <p className="text-xs text-destructive mt-1">{errors.durationDays.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Sale Price (৳)</label>
            <input {...register("salePrice")} type="number" step="0.01" className={inputClass} />
            {errors.salePrice && <p className="text-xs text-destructive">{errors.salePrice.message}</p>}
          </div>

          {/* New expiry preview */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">New expiry date</p>
            <p className="font-semibold text-primary mt-0.5">{formatDate(newExpiry)}</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Renew
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground";
