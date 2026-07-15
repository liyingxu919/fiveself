"use client";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function AboutContent() {
  const { lang } = useLang();
  const { aboutPage } = useSanityContent();
  const a = aboutPage;
  const s = (key: string) => a?.[`${key}${lang === "en" ? "En" : "Zh"}`] || "";

  const headline = [s("headline1"), s("headline2"), s("headline3")].filter(Boolean).join("\n") || (lang === "zh" ? "关于我们" : "About Us");

  const valueItems = a?.values?.length ? a.values.map((v: any) => ({
    title: (lang === "en" ? v.titleEn : v.titleZh) || "",
    desc: (lang === "en" ? v.descEn : v.descZh) || "",
  })) : [];

  return (
    <main>
      <section className="section">
        <div className="container-main max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="mb-8 text-center whitespace-pre-line">{headline}</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="aspect-[2/1] bg-[var(--color-bg-warm)] border border-[var(--color-border)] mb-12 flex items-center justify-center">
              <span className="text-sm text-[var(--color-text-secondary)]">{lang === "zh" ? "工作室摄影" : "Studio Photography"}</span>
            </div>
          </motion.div>
          {valueItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-1 gap-8 mt-20 md:grid-cols-3">
              {valueItems.map((v: any, i: number) => (
                <div key={i} className="text-center"><h3 className="mb-3 text-lg">{v.title}</h3><p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{v.desc}</p></div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <section className="section bg-[var(--color-bg-warm)]">
        <div className="container-main text-center">
          <h2 className="mb-6">{s("ctaHeading")}</h2>
          <Button href="/product/five-elements-blueprint">{lang === "zh" ? "探索你的能量蓝图" : "Explore Your Blueprint"}</Button>
        </div>
      </section>
    </main>
  );
}
