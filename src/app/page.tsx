export const revalidate = 60; // 每60秒刷新Sanity数据

import { client } from "@/sanity/lib/client";
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { SanityContentProvider, type SanityContent } from "@/i18n/SanityContentContext";
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

export default async function Home() {
  let homePage: SanityContent = null;
  let siteSettings: SanityContent = null;

  try {
    [homePage, siteSettings] = await Promise.all([
      client.fetch(HOME_PAGE_QUERY).catch(() => null),
      client.fetch(SITE_SETTINGS_QUERY).catch(() => null),
    ]);
  } catch { /* fallback to translations.ts */ }

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
