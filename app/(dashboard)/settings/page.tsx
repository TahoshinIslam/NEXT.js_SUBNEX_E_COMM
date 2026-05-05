"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Settings, Package, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCategoryIcon, getCategoryColor, formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const serviceSchema = z.object({
  name: z.string().min(1, "Name required"),
  category: z.enum(["AI", "STREAMING", "EDITING", "PRODUCTIVITY", "CLOUD", "MUSIC", "SECURITY", "GAMING", "OTHER"]),
  description: z.string().optional(),
  costPrice: z.coerce.number().optional(),
});
type ServiceForm = z.infer<typeof serviceSchema>;

const CATEGORIES = ["AI", "STREAMING", "EDITING", "PRODUCTIVITY", "CLOUD", "MUSIC", "SECURITY", "GAMING", "OTHER"];

async function fetchServices() {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"services" | "org">("services");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const services = data?.data ?? [];

  const createService = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create service");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Service added!" });
      qc.invalidateQueries({ queryKey: ["services"] });
      setShowServiceForm(false);
      reset();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Service removed" });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { category: "AI" },
  });

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto px-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your business configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-lg w-full sm:w-fit overflow-x-auto">
        {(["services", "org"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all whitespace-nowrap",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {t === "services" ? "Service Catalog" : "Organization"}
          </button>
        ))}
      </div>

      {tab === "services" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">{services.length} services configured</p>
            <button
              onClick={() => setShowServiceForm(!showServiceForm)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {/* Add Service Form */}
          {showServiceForm && (
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-4">New Service</h3>
              <form onSubmit={handleSubmit((d) => createService.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Name *</label>
                    <input {...register("name")} placeholder="ChatGPT Plus" className={inputClass} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Category *</label>
                    <select {...register("category")} className={inputClass}>
                      {CATEGORIES.map((c) => {
                        const Icon = getCategoryIcon(c);
                        return (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Description</label>
                    <input {...register("description")} placeholder="Optional description" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Your Cost (৳)</label>
                    <input {...register("costPrice")} type="number" step="0.01" placeholder="0.00" className={inputClass} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowServiceForm(false); reset(); }}
                    className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createService.isPending}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {createService.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Services grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-muted/30 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted/20 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="glass rounded-xl py-12 text-center">
              <Package className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground text-sm">No services yet. Add your first service.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service: any) => {
                const Icon = getCategoryIcon(service.category);
                return (
                  <div key={service.id} className="glass rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getCategoryColor(service.category))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded-md", getCategoryColor(service.category))}>
                          {service.category}
                        </span>
                        {service.costPrice && (
                          <span className="text-xs text-muted-foreground">Cost: {formatCurrency(service.costPrice)}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{service._count.subscriptions} subscriptions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteService.mutate(service.id)}
                    disabled={deleteService.isPending || service._count.subscriptions > 0}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:cursor-not-allowed disabled:opacity-0"
                    title={service._count.subscriptions > 0 ? "Cannot delete service with subscriptions" : "Delete service"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "org" && (
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Organization Settings</h3>
              <p className="text-xs text-muted-foreground">Your business configuration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Business Name", value: "My Resell Business" },
              { label: "Plan", value: "PRO" },
              { label: "Slug", value: "my-resell-biz" },
              { label: "Member Since", value: "2025" },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              To change organization details, contact support or update directly in the database.
              Multi-tenant upgrades and plan changes coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground";
