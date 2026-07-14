"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";
import { client } from "@/sanity/lib/client";
import { PRODUCTS_QUERY } from "@/sanity/lib/queries";
import ProductCard, { type ProductData } from "@/components/product/ProductCard";
import { products as staticProducts } from "@/data/products";

export default function BestSellerSection() {
  const { lang, t } = useLang();
  const { homePage } = useSanityContent();
  const bs = homePage?.bestSellers;
  const [items, setItems] = useState<ProductData[]>([]);

  const s = (key: string, fb: { en: string; zh: string }) => {
    if (bs) { const v = bs[`${key}${lang === "en" ? "En" : "Zh"}`]; if (v) return v; }
    return fb[lang];
  };

  useEffect(() => {
    client.fetch<ProductData[]>(PRODUCTS_QUERY)
      .then((d) => d?.length ? setItems(d) : setItems(staticProducts.map((p) => ({ _id: p.id, ...p }))))
      .catch(() => setItems(staticProducts.map((p) => ({ _id: p.id, ...p }))));
  }, []);

  return (
    <section className="section" id="shop">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="eyebrow mb-4">{s("subtitle", t.bestSellers.subtitle)}</p>
          <h2 className="mb-4">{s("title", t.bestSellers.title)}</h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" />
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {items.slice(0, 3).map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }}>
              <ProductCard product={p} lang={lang} viewDetailsLabel={s("viewDetails", t.bestSellers.viewDetails)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
