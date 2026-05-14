import { createContext, useContext, useMemo, type ReactNode } from "react";
import { translate, type Locale, type TranslationKey } from "./i18n";

interface I18nContextValue {
  locale: Locale;
  appName: string;
  websiteUrl: string | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  appName,
  websiteUrl,
  children,
}: {
  locale: Locale;
  appName: string;
  websiteUrl: string | null;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      appName,
      websiteUrl,
      t: (key, params) =>
        translate(locale, key, { app: appName, ...(params ?? {}) }),
    }),
    [locale, appName, websiteUrl],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "en",
      appName: "CMS",
      websiteUrl: null,
      t: (key, params) => translate("en", key, { app: "CMS", ...(params ?? {}) }),
    };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function useAppName(): string {
  return useI18n().appName;
}

export function useWebsiteUrl(): string | null {
  return useI18n().websiteUrl;
}
