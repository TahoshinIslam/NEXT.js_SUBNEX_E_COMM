"use client";

import { useState } from "react";
import { StoreHero } from "@/components/store/StoreHero";
import { CategoryRow } from "@/components/store/CategoryRow";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { HowItWorks } from "@/components/store/HowItWorks";
import { FeaturedDeals } from "@/components/store/FeaturedDeals";
import { FeaturesBento } from "@/components/store/FeaturesBento";
import { Testimonials } from "@/components/store/Testimonials";
import { FAQ } from "@/components/store/FAQ";
import { TrustBadges } from "@/components/store/TrustBadges";
import { NewsletterBanner } from "@/components/store/NewsletterBanner";
import { StoreFooter } from "@/components/store/StoreFooter";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
  basePrice?: number;
}

interface TestimonialType {
  id: string;
  name: string;
  location: string | null;
  text: string;
  rating: number;
}

interface StorePageClientProps {
  orgName: string;
  services: Service[];
  testimonials: TestimonialType[];
}

export function StorePageClient({ orgName, services, testimonials }: StorePageClientProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");

  return (
    <>
      <StoreHero orgName={orgName} />
      <CategoryRow 
        activeCategory={activeCategory} 
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          // Scroll to catalog section if needed
          const el = document.getElementById("all-subscriptions");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }} 
      />
      <FeaturedDeals services={services} />
      <StoreCatalog services={services} externalCategory={activeCategory} />
      <FeaturesBento />
      <HowItWorks />
      <Testimonials testimonials={testimonials} />
      <FAQ />
      <TrustBadges />
      <NewsletterBanner />
      <StoreFooter />
    </>
  );
}
