"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function MissionSection() {
  const { lang, t } = useLang();
  const { homePage } = useSanityContent();
  const m = homePage?.mission;

  const s = (key: string, fb: { en: string; zh: string }) => {
    if (m) { const v = m[`${key}${lang === "en" ? "En" : "Zh"}`]; if (v) return v; }
    return fb[lang];
  };

  return (
    <section className="section bg-[var(--color-bg-warm)] relative overflow-hidden">
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div className="h-[320px] w-[320px] rounded-full border border-[var(--color-border)] opacity-20 md:h-[420px] md:w-[420px]" />
      </div>
      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="aspect-[4/5] bg-[var(--color-bg-main)] border border-[var(--color-border)] flex items-center justify-center">
            <span className="text-sm text-[var(--color-text-secondary)]">{lang === "zh" ? "室内空间摄影" : "Interior Photograph"}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} className="max-w-md md:ml-auto">
            <p className="eyebrow mb-4">{s("eyebrow", t.mission.eyebrow)}</p>
            <h2 className="mb-6">{s("headline", t.mission.headline)}</h2>
            <p className="mb-4 text-base leading-relaxed text-[var(--color-text-secondary)]">{s("p1", t.mission.p1)}</p>
            <p className="mb-8 text-base leading-relaxed text-[var(--color-text-secondary)]">{s("p2", t.mission.p2)}</p>
            <Button href="/about" variant="primary">{s("cta", t.mission.cta)}</Button>
            <div className="mt-10 ml-auto w-fit">
              <div className="h-10 w-10 rounded-sm border border-[var(--color-terracotta)] flex items-center justify-center opacity-60">
                <span className="font-[var(--font-cn-display)] text-[10px] text-[var(--color-terracotta)]">印</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
