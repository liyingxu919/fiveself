"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";
import ProductCard, { type ProductData } from "@/components/product/ProductCard";
import { products as staticProducts } from "@/data/products";

export default function BestSellerSection() {
  const { lang } = useLang();
  const { homePage } = useSanityContent();
  const bs = homePage?.bestSellers;
  const [items, setItems] = useState<ProductData[]>([]);

  const s = (key: string) => bs?.[`${key}${lang === "en" ? "En" : "Zh"}`] || "";

  useEffect(() => {
    fetch("https://penxmsws.apicdn.sanity.io/v1/data/query/production?query=*[_type==\"product\"]|order(order+asc){_id,name,nameCn,category,description,price,features,\"image\":image.asset->url,\"slug\":slug.current,checkoutUrl}", { signal: AbortSignal.timeout(10000) })
      .then(r => r.json()).then(d => { if (d?.result?.length) setItems(d.result); else setItems(staticProducts.map(p => ({ _id: p.id, ...p }))); })
      .catch(() => setItems(staticProducts.map(p => ({ _id: p.id, ...p }))));
  }, []);

  return (
    <section className="section" id="shop">
      <div className="container-main">
        <div className="text-center mb-16"><p className="eyebrow mb-4">{s("subtitle")}</p><h2 className="mb-4">{s("title")}</h2><div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" /></div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {items.slice(0, 3).map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }}>
              <ProductCard product={p} lang={lang} viewDetailsLabel={s("viewDetails")} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
