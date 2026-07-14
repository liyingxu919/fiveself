"use client";

import { createContext, useContext, type ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SanityContent = Record<string, any> | null;

const Ctx = createContext<{
  homePage: SanityContent;
  siteSettings: SanityContent;
  aboutPage: SanityContent;
}>({ homePage: null, siteSettings: null, aboutPage: null });

export function SanityContentProvider({
  children,
  homePage,
  siteSettings,
  aboutPage,
}: {
  children: ReactNode;
  homePage: SanityContent;
  siteSettings: SanityContent;
  aboutPage: SanityContent;
}) {
  return (
    <Ctx.Provider value={{ homePage, siteSettings, aboutPage }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSanityContent() {
  return useContext(Ctx);
}
