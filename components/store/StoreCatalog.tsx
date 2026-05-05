"use client";

import { useState, useMemo } from "react";
import { ServiceCard } from "./ServiceCard";
import { getCategoryIcon } from "@/lib/utils";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { Search as SearchIcon } from "lucide-react";

const CATEGORIES = ["ALL", "AI", "STREAMING", "EDITING", "PRODUCTIVITY", "CLOUD", "OTHER"];

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
}

interface StoreCatalogProps {
  services: Service[];
  externalCategory?: string;
}

export function StoreCatalog({ services, externalCategory = "ALL" }: StoreCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterDuration, setFilterDuration] = useState("all");

  // Sync external category state if provided
  const currentCategory = externalCategory !== "ALL" ? externalCategory : activeCategory;

  const filtered = useMemo(() => {
    let result = services.filter((s) => {
      const matchCat = currentCategory === "ALL" || s.category === currentCategory;
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    // Apply sorting
    if (sortBy === "price_asc") {
      result = result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortBy === "price_desc") {
      result = result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (sortBy === "newest") {
      // Fake newest sort by reversing
      result = [...result].reverse();
    }

    return result;
  }, [services, currentCategory, search, sortBy]);

  // Group by category for display
  const grouped = useMemo(() => {
    if (currentCategory !== "ALL") return { [currentCategory]: filtered };
    return filtered.reduce<Record<string, Service[]>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
  }, [filtered, currentCategory]);

  const availableCategories = CATEGORIES.filter(
    (c) => c === "ALL" || services.some((s) => s.category === c)
  );

  return (
    <section className="max-w-6xl mx-auto px-4 pb-20 pt-8" id="all-subscriptions">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">All Subscriptions</h2>
          <p className="text-white/40 text-sm">Browse our full catalog of premium services.</p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#3b82f6]/50 focus:bg-white/[0.05] transition-colors"
            />
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#3b82f6]/50 appearance-none cursor-pointer hover:bg-white/[0.05] transition-colors"
          >
            <option value="popular">Sort: Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>

          <select
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#3b82f6]/50 appearance-none cursor-pointer hover:bg-white/[0.05] transition-colors"
          >
            <option value="all">Filter: All</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">One-time</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <p className="text-lg">No services found</p>
          <p className="text-sm mt-2">Try a different search or category</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, categoryServices]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-5">
                {(() => {
                  const Icon = getCategoryIcon(category);
                  return <Icon className="w-6 h-6 text-white/70" />;
                })()}
                <h2 className="text-lg font-bold text-white">{category}</h2>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/25">{categoryServices.length} service{categoryServices.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {categoryServices.map((service) => (
                  <ElectricBorder
                    key={service.id}
                    color="#3b82f6"
                    speed={0.8}
                    chaos={0.1}
                    thickness={1}
                    borderRadius={16}
                    style={{ display: "block" }}
                  >
                    <ServiceCard service={service} />
                  </ElectricBorder>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
