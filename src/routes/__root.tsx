import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import globalsCss from "~/styles/globals.css?url";
import { getAppMetaFn } from "~/server/server-fns/auth";
import { I18nProvider } from "~/lib/i18n-context";
import { translate, type Locale } from "~/lib/i18n";
import { ErrorScreen } from "~/components/error-screen";

export const Route = createRootRoute({
  loader: async () => getAppMetaFn(),
  head: (ctx) => {
    const meta = (ctx.loaderData as
      | { locale: Locale; appName: string; websiteUrl: string | null }
      | undefined) ?? {
      locale: "en" as Locale,
      appName: "CMS",
      websiteUrl: null,
    };
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: meta.appName },
      ],
      links: [{ rel: "stylesheet", href: globalsCss }],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootComponent() {
  const { locale, appName, websiteUrl } = Route.useLoaderData();
  return (
    <RootDocument locale={locale}>
      <I18nProvider locale={locale} appName={appName} websiteUrl={websiteUrl}>
        <Outlet />
      </I18nProvider>
    </RootDocument>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <RootDocument locale="en">
      <I18nProvider locale="en" appName="CMS" websiteUrl={null}>
        <ErrorScreen error={error} reset={reset} />
      </I18nProvider>
    </RootDocument>
  );
}

function NotFound() {
  const locale: Locale = "en";
  return (
    <RootDocument locale={locale}>
      <I18nProvider locale={locale} appName="CMS" websiteUrl={null}>
        <div className="min-h-screen grid place-items-center p-12 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{translate(locale, "notFound.title")}</h1>
            <p className="text-sm text-(--color-muted-foreground)">
              {translate(locale, "notFound.description")}
            </p>
          </div>
        </div>
      </I18nProvider>
    </RootDocument>
  );
}

function RootDocument({
  locale,
  children,
}: Readonly<{ locale: Locale; children: ReactNode }>) {
  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster richColors closeButton position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}
