"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";
import { client } from "@/sanity/lib/client";
import { TESTIMONIALS_QUERY } from "@/sanity/lib/queries";
import { testimonials as staticTestimonials } from "@/data/testimonials";

interface TestimonialData { _id: string; quote: string; name: string; location: string; avatar?: string; }

export default function TestimonialsSection() {
  const { lang, t } = useLang();
  const { homePage } = useSanityContent();
  const ts = homePage?.testimonialsSec;
  const [items, setItems] = useState<TestimonialData[]>([]);

  const title = ts?.[`title${lang === "en" ? "En" : "Zh"}`] || t.testimonials.title[lang];

  useEffect(() => {
    client.fetch<TestimonialData[]>(TESTIMONIALS_QUERY)
      .then((d) => d?.length ? setItems(d) : setItems(staticTestimonials.map((x) => ({ _id: x.id, ...x }))))
      .catch(() => setItems(staticTestimonials.map((x) => ({ _id: x.id, ...x }))));
  }, []);

  return (
    <section className="section" id="testimonials">
      <div className="container-main">
        <div className="text-center mb-16">
          <h2 className="mb-4">{title}</h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" />
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.slice(0, 3).map((item, i) => (
            <motion.blockquote key={item._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} className="flex flex-col items-center text-center">
              <span className="mb-6 font-[var(--font-display)] text-5xl leading-none text-[var(--color-border)]">&ldquo;</span>
              <p className="mb-6 max-w-sm text-base leading-relaxed text-[var(--color-text-secondary)]">{item.quote}</p>
              <div className="mt-auto">
                {item.avatar ? <Image src={item.avatar} alt={item.name} width={40} height={40} className="mx-auto mb-3 h-10 w-10 rounded-full border border-[var(--color-border)] object-cover" /> : <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-[var(--color-bg-warm)] border border-[var(--color-border)]" />}
                <p className="text-sm font-medium text-[var(--color-text-main)]">{item.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{item.location}</p>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
