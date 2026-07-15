"use client";

import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function SiteFooter() {
  const { lang, t } = useLang();
  const { siteSettings } = useSanityContent();

  const s = (key: string, fb: string) => siteSettings?.[`${key}${lang === "en" ? "En" : "Zh"}`] || fb;

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <p className="font-[var(--font-display)] text-xl text-[var(--color-text-main)] mb-3">
              {s("brandName", t.shared.brandName[lang])}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
              {s("footerDesc", t.footer.brandDesc[lang])}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-main)] mb-4">{t.footer.collection[lang]}</p>
            <div className="flex flex-col gap-2">
              <a href="/product/five-elements-blueprint" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">{t.footer.blueprint[lang]}</a>
              <a href="/product/annual-element-guide" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">{t.footer.annualGuide[lang]}</a>
              <a href="/product/gift-edition" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">{t.footer.giftEdition[lang]}</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-main)] mb-4">{t.footer.contact[lang]}</p>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
              <a href={`mailto:${siteSettings?.contactEmail || "hello@orientalaesthetic.com"}`} className="hover:text-[var(--color-text-main)] transition-colors">
                {siteSettings?.contactEmail || "hello@orientalaesthetic.com"}
              </a>
              {siteSettings?.instagramUrl && (
                <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-main)] transition-colors">Instagram</a>
              )}
              {siteSettings?.pinterestUrl && (
                <a href={siteSettings.pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-main)] transition-colors">Pinterest</a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col gap-2 sm:flex-row sm:justify-between text-xs text-[var(--color-text-secondary)]">
          <p>{s("disclaimer", t.footer.disclaimer[lang])}</p>
          <p className="whitespace-nowrap">&copy; {new Date().getFullYear()} {s("brandName", t.shared.brandName[lang])}</p>
        </div>
      </div>
    </footer>
  );
}
