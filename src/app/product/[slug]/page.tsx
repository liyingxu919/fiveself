"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Button from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { client } from "@/sanity/lib/client";
import { PRODUCTS_QUERY } from "@/sanity/lib/queries";
import type { ProductData } from "@/components/product/ProductCard";
import { products as staticProducts } from "@/data/products";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { lang } = useLang();
  const [product, setProduct] = useState<ProductData | null>(null);

  useEffect(() => {
    client.fetch<ProductData[]>(PRODUCTS_QUERY)
      .then((data) => {
        const found = data?.find((p) => p.slug === slug);
        if (found) { setProduct(found); return; }
        const fb = staticProducts.find((p) => p.id === slug || p.href?.includes(slug));
        setProduct(fb ? { _id: fb.id, ...fb } : null);
      })
      .catch(() => {
        const fb = staticProducts.find((p) => p.id === slug || p.href?.includes(slug));
        setProduct(fb ? { _id: fb.id, ...fb } : null);
      });
  }, [slug]);

  if (!product) {
    return (
      <>
        <SiteHeader />
        <main className="section"><div className="container-main text-center"><p>{lang === "zh" ? "产品未找到" : "Product not found"}</p></div></main>
        <SiteFooter />
      </>
    );
  }

  const displayName = lang === "zh" ? product.nameCn : product.name;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="section">
          <div className="container-main">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="aspect-[4/5] bg-[var(--color-bg-warm)] border border-[var(--color-border)] relative overflow-hidden">
                {product.image ? (
                  <Image src={product.image} alt={displayName} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-secondary)]">{displayName}</div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
                <p className="eyebrow mb-2">{product.category}</p>
                <h1 className="mb-2">{displayName}</h1>
                <p className="mb-6 text-sm text-[var(--color-text-secondary)]">{lang === "zh" ? product.name : product.nameCn}</p>
                <p className="mb-8 text-base leading-relaxed text-[var(--color-text-secondary)]">{product.description}</p>

                <div className="mb-10 grid grid-cols-2 gap-3">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-[var(--color-green-muted)]">&#10003;</span>
                      <span className="text-[var(--color-text-secondary)]">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Price + Purchase */}
                <div className="flex items-center gap-6 mb-10">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">{lang === "zh" ? "价格" : "Price"}</p>
                    <p className="text-3xl font-[var(--font-display)] text-[var(--color-terracotta)]">${product.price}</p>
                  </div>
                  {product.checkoutUrl ? (
                    <a
                      href={product.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 min-h-[46px] px-6 text-xs font-medium uppercase tracking-[0.08em] bg-[var(--color-green-dark)] text-white hover:bg-[#1d2e24] transition-colors duration-300"
                    >
                      {lang === "zh" ? "立即购买" : "Purchase Now"} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <Button href="#" variant="primary">
                      {lang === "zh" ? "立即咨询" : "Inquire Now"}
                    </Button>
                  )}
                </div>
                {product.checkoutUrl && (
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {lang === "zh"
                      ? "点击购买后将跳转至 Lemon Squeezy 安全支付页面"
                      : "You'll be redirected to Lemon Squeezy for secure checkout"}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section bg-[var(--color-bg-warm)]">
          <div className="container-main text-center">
            <h3 className="mb-8">{lang === "zh" ? "你可能也喜欢" : "You May Also Enjoy"}</h3>
            <Button href="/shop" variant="outline">{lang === "zh" ? "浏览全部产品" : "Browse All Products"}</Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
