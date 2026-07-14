import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY, ABOUT_PAGE_QUERY } from "@/sanity/lib/queries";
import { SanityContentProvider, type SanityContent } from "@/i18n/SanityContentContext";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AboutContent from "@/components/home/AboutContent";

export default async function AboutPage() {
  let aboutPage: SanityContent = null;
  let siteSettings: SanityContent = null;

  try {
    [aboutPage, siteSettings] = await Promise.all([
      client.fetch(ABOUT_PAGE_QUERY).catch(() => null),
      client.fetch(SITE_SETTINGS_QUERY).catch(() => null),
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
