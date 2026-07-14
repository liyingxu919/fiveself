"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang } from "./translations";
import { t as translations } from "./translations";

interface LanguageCtx {
  lang: Lang;
  toggleLang: () => void;
  t: typeof translations;
}

const Ctx = createContext<LanguageCtx>({
  lang: "en",
  toggleLang: () => {},
  t: translations,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  return (
    <Ctx.Provider value={{ lang, toggleLang, t: translations }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang() {
  return useContext(Ctx);
}
