"use client";

import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function HowItWorksSection() {
  const { lang, t } = useLang();
  const { homePage } = useSanityContent();
  const hiw = homePage?.howItWorks;

  const title = hiw?.[`title${lang === "en" ? "En" : "Zh"}`] || t.howItWorks.title[lang];

  const rawSteps = hiw?.steps?.length
    ? hiw.steps
    : t.howItWorks.steps.map((s: { title: { en: string; zh: string }; desc: { en: string; zh: string } }) => ({
        titleEn: s.title.en, titleZh: s.title.zh, descEn: s.desc.en, descZh: s.desc.zh,
      }));

  const steps = rawSteps.map((st: { titleEn?: string; titleZh?: string; descEn?: string; descZh?: string }) => ({
    title: (lang === "en" ? st.titleEn : st.titleZh) || "",
    desc: (lang === "en" ? st.descEn : st.descZh) || "",
  }));

  return (
    <section className="section" id="how-it-works">
      <div className="container-main">
        <div className="text-center mb-16">
          <h2 className="mb-4">{title}</h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step: { title: string; desc: string }, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-light)]">
                <span className="font-[var(--font-display)] text-xl text-[var(--color-green-muted)]">{["I","II","III","IV"][i]}</span>
              </div>
              <h3 className="text-lg font-normal">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-[200px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
