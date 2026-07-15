export const revalidate = 60;

import { SITE_SETTINGS_QUERY, ABOUT_PAGE_QUERY } from "@/sanity/lib/queries";
import { SanityContentProvider, type SanityContent } from "@/i18n/SanityContentContext";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AboutContent from "@/components/home/AboutContent";

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

export default async function AboutPage() {
  let aboutPage: SanityContent = null;
  let siteSettings: SanityContent = null;

  try {
    [aboutPage, siteSettings] = await Promise.all([
      fetchSanity(ABOUT_PAGE_QUERY),
      fetchSanity(SITE_SETTINGS_QUERY),
    ]);
  } catch { /* fallback */ }

  return (
    <SanityContentProvider homePage={null} siteSettings={siteSettings} aboutPage={aboutPage}>
      <SiteHeader />
      <AboutContent />
      <SiteFooter />
    </SanityContentProvider>
  );
}
