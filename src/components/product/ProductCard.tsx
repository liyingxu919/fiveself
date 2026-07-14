import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Lang } from "@/i18n/translations";

export interface ProductData {
  _id: string;
  name: string;
  nameCn: string;
  category: string;
  description: string;
  price: number;
  features: string[];
  checkoutUrl?: string;
  image?: string;
  slug?: string;
}

interface ProductCardProps {
  product: ProductData;
  lang: Lang;
  viewDetailsLabel: string;
}

export default function ProductCard({ product, lang, viewDetailsLabel }: ProductCardProps) {
  const displayName = lang === "zh" ? product.nameCn : product.name;
  const detailHref = product.slug ? `/product/${product.slug}` : "/shop";
  const purchaseLabel = lang === "zh" ? "立即购买" : "Purchase";

  return (
    <article className="group flex flex-col bg-[var(--color-bg-light)] border border-[rgba(80,70,60,0.1)] transition-all duration-[420ms] hover:scale-[1.02]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-warm)]">
        {product.image ? (
          <Image src={product.image} alt={displayName} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-secondary)]">{displayName}</div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">{product.category}</span>
        <h3 className="text-[22px] font-normal leading-tight">{displayName}</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-normal text-[var(--color-terracotta)]">${product.price}</span>
          <div className="flex items-center gap-4">
            <Link href={detailHref} className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-secondary)] hover:text-[var(--color-green-dark)] transition-colors duration-300">
              {viewDetailsLabel}
            </Link>
            {product.checkoutUrl && (
              <a href={product.checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.08em] bg-[var(--color-green-dark)] text-white px-4 py-2 hover:bg-[#1d2e24] transition-colors duration-300">
                {purchaseLabel} <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
