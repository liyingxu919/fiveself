export const revalidate = 60;

import { draftMode } from "next/headers";
import { SanityContentProvider, type SanityContent } from "@/i18n/SanityContentContext";
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { client, stegaClient } from "@/sanity/lib/client";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import HeroSection from "@/components/home/HeroSection";
import BenefitsStrip from "@/components/home/BenefitsStrip";
import BestSellerSection from "@/components/home/BestSellerSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import SampleSection from "@/components/home/SampleSection";
import MissionSection from "@/components/home/MissionSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";

const SANITY_CDN = "https://penxmsws.apicdn.sanity.io/v1/data/query/production";

async function fetchSanity(query: string): Promise<SanityContent> {
  try {
    const res = await fetch(`${SANITY_CDN}?query=${encodeURIComponent(query)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  let homePage: SanityContent = null;
  let siteSettings: SanityContent = null;

  // Use stega client in draft/preview mode, CDN fetch in production
  try {
    const store = await draftMode();
    if (store.isEnabled) {
      [homePage, siteSettings] = await Promise.all([
        stegaClient.fetch(HOME_PAGE_QUERY).catch(() => null),
        stegaClient.fetch(SITE_SETTINGS_QUERY).catch(() => null),
      ]);
    } else {
      [homePage, siteSettings] = await Promise.all([
        fetchSanity(HOME_PAGE_QUERY),
        fetchSanity(SITE_SETTINGS_QUERY),
      ]);
    }
  } catch {
    [homePage, siteSettings] = await Promise.all([
      fetchSanity(HOME_PAGE_QUERY),
      fetchSanity(SITE_SETTINGS_QUERY),
    ]);
  }

  return (
    <SanityContentProvider homePage={homePage} siteSettings={siteSettings} aboutPage={null}>
      <SiteHeader />
      <main>
        <HeroSection />
        <BenefitsStrip />
        <BestSellerSection />
        <HowItWorksSection />
        <SampleSection />
        <MissionSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </SanityContentProvider>
  );
}
