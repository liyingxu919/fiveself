"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function FaqSection() {
  const { lang } = useLang();
  const { homePage } = useSanityContent();
  const f = homePage?.faq;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const title = f?.[`title${lang === "en" ? "En" : "Zh"}`] || "";
  const rawQs = f?.questions?.length ? f.questions : [];
  const questions = rawQs.map((q: any) => ({ q: (lang === "en" ? q.qEn : q.qZh) || "", a: (lang === "en" ? q.aEn : q.aZh) || "" }));

  return (
    <section className="section" id="faq">
      <div className="container-main max-w-2xl">
        <div className="text-center mb-16"><h2 className="mb-4">{title}</h2><div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" /></div>
        <div className="flex flex-col divide-y divide-[var(--color-border)]">
          {questions.map((item: any, i: number) => (
            <div key={i} className="py-5">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex w-full items-center justify-between gap-4 text-left">
                <span className="text-base font-medium text-[var(--color-text-main)]">{item.q}</span>
                {openIdx === i ? <Minus size={14} className="shrink-0 text-[var(--color-text-secondary)]" /> : <Plus size={14} className="shrink-0 text-[var(--color-text-secondary)]" />}
              </button>
              <AnimatePresence>{openIdx === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"><p className="pt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
