"use client";
import { motion } from "framer-motion";
import { User, Flower2, FileText, Gift, Lock, Heart, Star, Eye } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

const iconMap: Record<string, any> = { user: User, flower: Flower2, file: FileText, gift: Gift, lock: Lock, heart: Heart, star: Star, eye: Eye };

export default function BenefitsStrip() {
  const { lang } = useLang();
  const { homePage } = useSanityContent();
  const b = homePage?.benefits;
  const rawItems = b?.items?.length ? b.items : [];
  const items = rawItems.map((item: any) => ({
    Icon: iconMap[item.icon || "star"] || Star,
    title: (lang === "en" ? item.titleEn : item.titleZh) || "",
    desc: (lang === "en" ? item.descEn : item.descZh) || "",
  }));

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-light)]">
      <div className="container-main">
        <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-3 md:grid-cols-5 md:divide-x md:divide-y-0">
          {items.map((item: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex flex-col items-center gap-3 px-6 py-9 text-center">
              <item.Icon size={22} strokeWidth={1} className="text-[var(--color-green-muted)]" />
              <h4 className="text-[13px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-main)]">{item.title}</h4>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] max-w-[180px]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
