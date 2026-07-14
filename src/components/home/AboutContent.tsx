"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

const fallbackValues = [
  {
    titleEn: "Modern, not mystical", titleZh: "现代，而非神秘",
    descEn: "We translate ancient wisdom into contemporary visual language — no dragons, no superstition.",
    descZh: "我们将古老智慧转化为当代视觉语言——没有龙，没有迷信。",
  },
  {
    titleEn: "Personal, not generic", titleZh: "专属，而非模板",
    descEn: "Every report begins with your unique birth chart. No two Blueprints are alike.",
    descZh: "每份报告都始于你独一无二的出生信息。没有两份蓝图是相同的。",
  },
  {
    titleEn: "Beautiful, not loud", titleZh: "安静，而非喧嚣",
    descEn: "Our aesthetic is calm, editorial, and restrained. We let the elements speak softly.",
    descZh: "我们的美学是安静、编辑式、克制的。让元素轻声诉说。",
  },
];

export default function AboutContent() {
  const { lang, t } = useLang();
  const { aboutPage } = useSanityContent();
  const a = aboutPage;

  const s = (key: string, fb: string) => {
    if (a) { const v = a[`${key}${lang === "en" ? "En" : "Zh"}`]; if (v) return v; }
    return fb;
  };

  const headline = s("headline1", lang === "zh" ? "东方美学" : "Oriental Aesthetic")
    + "\n" + s("headline2", lang === "zh" ? "立足于东方智慧" : "is a design studio")
    + "\n" + s("headline3", lang === "zh" ? "与视觉叙事的交汇点" : "at the intersection of Eastern wisdom and visual storytelling");

  const valueItems = a?.values?.length
    ? a.values.map((v: { titleEn?: string; titleZh?: string; descEn?: string; descZh?: string }) => ({
        title: (lang === "en" ? v.titleEn : v.titleZh) || "",
        desc: (lang === "en" ? v.descEn : v.descZh) || "",
      }))
    : fallbackValues.map((v) => ({ title: v[lang === "zh" ? "titleZh" : "titleEn"], desc: v[lang === "zh" ? "descZh" : "descEn"] }));

  const ctaHeading = s("ctaHeading", lang === "zh" ? "准备好探索你的五行蓝图了吗？" : "Ready to discover your elements?");

  return (
    <main>
      <section className="section">
        <div className="container-main max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="mb-8 text-center whitespace-pre-line">{headline}</h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="prose mx-auto">
            <div className="aspect-[2/1] bg-[var(--color-bg-warm)] border border-[var(--color-border)] mb-12 flex items-center justify-center">
              <span className="text-sm text-[var(--color-text-secondary)]">{lang === "zh" ? "工作室摄影" : "Studio Photography"}</span>
            </div>
            <h2 className="mb-6 text-center">{t.mission.headline[lang]}</h2>
            <p className="mb-6 text-base leading-relaxed text-[var(--color-text-secondary)] text-center max-w-xl mx-auto">{t.mission.p1[lang]}</p>
            <p className="mb-10 text-base leading-relaxed text-[var(--color-text-secondary)] text-center max-w-xl mx-auto">{t.mission.p2[lang]}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 gap-8 mt-20 md:grid-cols-3">
            {valueItems.map((v: { title: string; desc: string }, i: number) => (
              <div key={i} className="text-center">
                <h3 className="mb-3 text-lg">{v.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{v.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section bg-[var(--color-bg-warm)]">
        <div className="container-main text-center">
          <h2 className="mb-6">{ctaHeading}</h2>
          <Button href="/product/five-elements-blueprint">{t.hero.cta[lang]}</Button>
        </div>
      </section>
    </main>
  );
}
