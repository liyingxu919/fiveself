"use client";

import { motion } from "framer-motion";
import ProductCard, { type ProductData } from "@/components/product/ProductCard";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";
import { products as staticProducts } from "@/data/products";

export default function ShopContent({ products }: { products: ProductData[] | null }) {
  const { lang, t } = useLang();
  const { homePage } = useSanityContent();
  const bs = homePage?.bestSellers;

  const s = (key: string, fb: { en: string; zh: string }) => {
    if (bs) { const v = bs[`${key}${lang === "en" ? "En" : "Zh"}`]; if (v) return v; }
    return fb[lang];
  };

  const items = (products && products.length > 0)
    ? products
    : staticProducts.map((p) => ({ _id: p.id, ...p }));

  return (
    <main>
      <section className="section">
        <div className="container-main">
          <div className="text-center mb-16">
            <p className="eyebrow mb-4">{s("subtitle", t.bestSellers.subtitle)}</p>
            <h2>{s("title", t.bestSellers.title)}</h2>
            <div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" />
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProductCard product={p} lang={lang} viewDetailsLabel={s("viewDetails", t.bestSellers.viewDetails)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
