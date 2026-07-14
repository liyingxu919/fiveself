"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function SampleSection() {
  const { lang, t } = useLang();
  const { homePage, siteSettings } = useSanityContent();
  const sm = homePage?.sample;
  const email = siteSettings?.contactEmail || "hello@orientalaesthetic.com";

  const s = (key: string, fb: { en: string; zh: string }) => {
    if (sm) { const v = sm[`${key}${lang === "en" ? "En" : "Zh"}`]; if (v) return v; }
    return fb[lang];
  };

  return (
    <section className="section bg-[var(--color-bg-light)]" id="sample">
      <div className="container-main">
        <div className="text-center mb-16">
          <h2 className="mb-4">{s("title", t.sample.title)}</h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" />
        </div>
        <div className="flex justify-center gap-6 md:gap-10 mb-12">
          {[1, 2, 3].map((n) => (
            <motion.div key={n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: n * 0.1 }} className="h-[300px] w-[210px] rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-main)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:h-[380px] md:w-[260px]" />
          ))}
        </div>
        <div className="text-center">
          <p className="mb-6 text-sm text-[var(--color-text-secondary)]">{s("desc", t.sample.desc)}</p>
          <Button href={`mailto:${email}`} variant="outline">{s("cta", t.sample.cta)}</Button>
        </div>
      </div>
    </section>
  );
}
