"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ProductCard, { type ProductData } from "@/components/product/ProductCard";
import { useLang } from "@/i18n/LanguageContext";
import { client } from "@/sanity/lib/client";
import { PRODUCTS_QUERY } from "@/sanity/lib/queries";
import { products as staticProducts } from "@/data/products";

export default function ShopPage() {
  const { lang, t } = useLang();
  const [items, setItems] = useState<ProductData[]>([]);

  useEffect(() => {
    client
      .fetch<ProductData[]>(PRODUCTS_QUERY)
      .then((d) => d?.length ? setItems(d) : setItems(staticProducts.map((p) => ({ _id: p.id, ...p }))))
      .catch(() => setItems(staticProducts.map((p) => ({ _id: p.id, ...p }))));
  }, []);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="section">
          <div className="container-main">
            <div className="text-center mb-16">
              <p className="eyebrow mb-4">{t.bestSellers.subtitle[lang]}</p>
              <h2>{t.bestSellers.title[lang]}</h2>
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
                  <ProductCard product={p} lang={lang} viewDetailsLabel={t.bestSellers.viewDetails[lang]} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
