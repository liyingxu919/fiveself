"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useSanityContent } from "@/i18n/SanityContentContext";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { lang, toggleLang } = useLang();
  const { siteSettings } = useSanityContent();

  const brandName = siteSettings?.[`brandName${lang === "en" ? "En" : "Zh"}`] || "";

  const navItems = [
    { label: lang === "en" ? "Shop" : "精品", href: "/shop" },
    { label: lang === "en" ? "How It Works" : "购买流程", href: "/#how-it-works" },
    { label: lang === "en" ? "Sample Report" : "样品预览", href: "/#sample" },
    { label: lang === "en" ? "About" : "关于我们", href: "/about" },
    { label: lang === "en" ? "FAQs" : "常见问题", href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-[rgba(250,248,243,0.94)] backdrop-blur-[8px] border-b border-[rgba(50,45,38,0.08)]">
      <div className="container-main flex h-full items-center justify-between">
        <Link href="/" className="font-[var(--font-display)] text-xl font-medium tracking-wide text-[var(--color-text-main)]">
          {brandName}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors duration-300">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <button onClick={toggleLang} className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">
            {lang === "en" ? "中" : "EN"}
          </button>
          <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors" aria-label="Account"><User size={16} /></button>
          <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors" aria-label="Cart"><ShoppingBag size={16} /></button>
        </div>
        <button className="md:hidden text-[var(--color-text-main)]" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
          <div className="container-main flex flex-col gap-4 py-6">
            {navItems.map((item) => <Link key={item.label} href={item.href} className="text-sm font-medium text-[var(--color-text-main)]" onClick={() => setOpen(false)}>{item.label}</Link>)}
            <div className="flex items-center gap-6 pt-2 border-t border-[var(--color-border)]">
              <button onClick={toggleLang} className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">{lang === "en" ? "中" : "EN"}</button>
              <User size={16} className="text-[var(--color-text-secondary)]" />
              <ShoppingBag size={16} className="text-[var(--color-text-secondary)]" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
