export const revalidate = 60;

import { SanityContentProvider, type SanityContent } from "@/i18n/SanityContentContext";
import { PRODUCTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ShopContent from "@/components/home/ShopContent";

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

export default async function ShopPage() {
  const [products, siteSettings] = await Promise.all([
    fetchSanity(PRODUCTS_QUERY),
    fetchSanity(SITE_SETTINGS_QUERY),
  ]);

  return (
    <SanityContentProvider homePage={null} siteSettings={siteSettings} aboutPage={null}>
      <SiteHeader />
      <ShopContent products={products} />
      <SiteFooter />
    </SanityContentProvider>
  );
}
