"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const schema = z.object({
  clientId: z.string().min(1, "Select a client"),
  serviceId: z.string().min(1, "Select a service"),
  purchaseDate: z.string().min(1, "Purchase date required"),
  durationDays: z.coerce.number().int().min(1, "Min 1 day").max(3650),
  salePrice: z.coerce.number().min(0, "Price required"),
  credentials: z.string().optional(),
  notes: z.string().optional(),
  autoRenew: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const DURATION_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

export function SubscriptionFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchaseDate: format(new Date(), "yyyy-MM-dd"),
      durationDays: 30,
      autoRenew: false,
    },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients?pageSize=100").then(r => r.json()),
      fetch("/api/services").then(r => r.json()),
    ]).then(([c, s]) => {
      setClients(c.data ?? []);
      setServices(s.data ?? []);
    });
  }, []);

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      toast({ title: "Subscription created!" });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold">New Subscription</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <Field label="Client *" error={errors.clientId?.message}>
            <select {...register("clientId")} className={selectClass}>
              <option value="">Select client...</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Service *" error={errors.serviceId?.message}>
            <select {...register("serviceId")} className={selectClass}>
              <option value="">Select service...</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </Field>

          <Field label="Purchase Date *" error={errors.purchaseDate?.message}>
            <input {...register("purchaseDate")} type="date" className={inputClass} />
          </Field>

          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">Duration</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {DURATION_PRESETS.map((p) => (
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
            <input {...register("durationDays")} type="number" placeholder="Custom days" className={inputClass} />
            {errors.durationDays && <p className="text-xs text-destructive mt-1">{errors.durationDays.message}</p>}
          </div>

          <Field label="Sale Price (৳) *" error={errors.salePrice?.message}>
            <input {...register("salePrice")} type="number" step="0.01" placeholder="0.00" className={inputClass} />
          </Field>

          <Field label="Credentials / Login Info" error={errors.credentials?.message}>
            <textarea {...register("credentials")} rows={2} placeholder="email: ... / password: ..." className={`${inputClass} resize-none`} />
          </Field>

          <Field label="Notes" error={errors.notes?.message}>
            <textarea {...register("notes")} rows={2} placeholder="Any notes..." className={`${inputClass} resize-none`} />
          </Field>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input {...register("autoRenew")} type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm">Auto-renew reminder</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground";
const selectClass = `${inputClass} cursor-pointer`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
