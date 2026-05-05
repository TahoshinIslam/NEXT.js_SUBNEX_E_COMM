"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, Plus, Search, Phone, Mail } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { ClientFormModal } from "@/components/clients/ClientFormModal";

async function fetchClients(search: string, page: number) {
  const params = new URLSearchParams({ search, page: String(page), pageSize: "20" });
  const res = await fetch(`/api/clients?${params}`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["clients", search, page],
    queryFn: () => fetchClients(search, page),
  });

  const clients = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total clients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search clients by name, email, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contact</th>
              <th className="text-center px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Subs</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-4 bg-muted/30 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>No clients found</p>
                </td>
              </tr>
            ) : (
              clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email ?? "No email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex flex-col gap-0.5">
                      {client.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {client._count.subscriptions}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                    {formatDate(client.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md text-xs border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1.5 rounded-md text-xs border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ClientFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetch(); }}
        />
      )}
    </div>
  );
}
