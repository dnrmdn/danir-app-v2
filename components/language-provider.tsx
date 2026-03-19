"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type AppLocale = "id" | "en";

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const STORAGE_KEY = "danir-app-locale";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getBrowserLocale(): AppLocale {
  if (typeof navigator === "undefined") {
    return "id";
  }

  const language = navigator.language.toLowerCase();
  return language.startsWith("id") ? "id" : "en";
}

function getInitialLocale(): AppLocale {
  if (typeof window === "undefined") {
    return "id";
  }

  const savedLocale = window.localStorage.getItem(STORAGE_KEY);
  return savedLocale === "id" || savedLocale === "en" ? savedLocale : getBrowserLocale();
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(getInitialLocale);

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
      document.documentElement.lang = nextLocale;
    }
  };

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
