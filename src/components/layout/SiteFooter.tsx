"use client";

import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function SiteFooter() {
  const { lang } = useLang();
  const { siteSettings } = useSanityContent();

  const g = (key: string) => siteSettings?.[`${key}${lang === "en" ? "En" : "Zh"}`] || "";

  const enLabels: Record<string, string> = { collection: "Collection", contact: "Contact", blueprint: "Blueprint", annualGuide: "Annual Guide", giftEdition: "Gift Edition" };
  const zhLabels: Record<string, string> = { collection: "产品系列", contact: "联系我们", blueprint: "能量蓝图", annualGuide: "年度指南", giftEdition: "礼物版" };
  const l = (k: string) => lang === "en" ? enLabels[k] : zhLabels[k];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <p className="font-[var(--font-display)] text-xl text-[var(--color-text-main)] mb-3">{g("brandName")}</p>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">{g("footerDesc")}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-main)] mb-4">{l("collection")}</p>
            <div className="flex flex-col gap-2">
              <a href="/product/five-elements-blueprint" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">{l("blueprint")}</a>
              <a href="/product/annual-element-guide" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">{l("annualGuide")}</a>
              <a href="/product/gift-edition" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">{l("giftEdition")}</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-main)] mb-4">{l("contact")}</p>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
              <a href={`mailto:${siteSettings?.contactEmail || ""}`} className="hover:text-[var(--color-text-main)] transition-colors">{siteSettings?.contactEmail || ""}</a>
              {siteSettings?.instagramUrl && <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-main)] transition-colors">Instagram</a>}
              {siteSettings?.pinterestUrl && <a href={siteSettings.pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-main)] transition-colors">Pinterest</a>}
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col gap-2 sm:flex-row sm:justify-between text-xs text-[var(--color-text-secondary)]">
          <p>{g("disclaimer")}</p>
          <p className="whitespace-nowrap">&copy; {new Date().getFullYear()} {g("brandName")}</p>
        </div>
      </div>
    </footer>
  );
}
