"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function HeroSection() {
  const { lang, t } = useLang();
  const { homePage } = useSanityContent();
  const h = homePage?.hero;

  const s = (key: string, fb: { en: string; zh: string }) => {
    if (h) {
      const v = h[`${key}${lang === "en" ? "En" : "Zh"}`];
      if (v) return v;
    }
    return fb[lang];
  };

  return (
    <section className="relative overflow-hidden decor-section">
      <div className="container-main relative z-10">
        <div className="grid items-center gap-12 py-16 md:min-h-[540px] md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center md:text-left"
          >
            <p className="eyebrow mb-4">{s("eyebrow", t.hero.eyebrow)}</p>
            <h1 className="mb-6">
              {s("headline1", t.hero.headline1)}<br />{s("headline2", t.hero.headline2)}
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
              {s("description", t.hero.description)}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
              <Button href="/product/five-elements-blueprint">{s("cta", t.hero.cta)}</Button>
              <Button href="#sample" variant="outline">{s("sampleBtn", t.hero.viewSample)}</Button>
            </div>
            <div className="mt-10 flex items-center gap-4 text-xs text-[var(--color-text-secondary)] justify-center md:justify-start">
              <span>{s("trust1", t.hero.trust1)}</span>
              <span className="h-3 w-px bg-[var(--color-border)]" /><span>{s("trust2", t.hero.trust2)}</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative flex items-center justify-center min-h-[380px] md:min-h-[460px]"
          >
            <div className="relative w-full max-w-[420px]">
              <div className="mx-auto h-[340px] w-[260px] rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-light)] shadow-[0_2px_24px_rgba(0,0,0,0.06)] md:h-[400px] md:w-[300px]" />
              <div className="absolute -bottom-2 -right-2 h-[160px] w-[120px] rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-light)] shadow-[0_2px_16px_rgba(0,0,0,0.05)] md:h-[200px] md:w-[150px]" />
              <div className="absolute -left-4 -top-4 h-[100px] w-[100px] rounded-full border border-[var(--color-border)] opacity-40 md:h-[130px] md:w-[130px]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
