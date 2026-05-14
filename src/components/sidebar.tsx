import { Link } from "@tanstack/react-router";
import { Database, ExternalLink, LogOut } from "lucide-react";
import type { CollectionSummary } from "~/lib/field-types";
import { Button } from "./ui/button";
import { logoutFn } from "~/server/server-fns/auth";
import { useI18n } from "~/lib/i18n-context";

interface Props {
  collections: ReadonlyArray<CollectionSummary>;
  activeId?: string;
  email?: string;
  onNavigate?: () => void;
}

export function Sidebar({ collections, activeId, email, onNavigate }: Props) {
  const { t, websiteUrl } = useI18n();
  return (
    <aside className="w-64 shrink-0 border-r border-(--color-border) bg-(--color-muted) h-full flex flex-col">
      <div className="px-4 py-4 border-b border-(--color-border)">
        <div className="text-sm font-semibold">{t("app.title")}</div>
        {email && (
          <div className="text-xs text-(--color-muted-foreground) truncate">{email}</div>
        )}
      </div>
      {websiteUrl && (
        <div className="px-2 pt-2">
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-foreground) hover:bg-(--color-background) transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("sidebar.viewSite")}</span>
            </span>
          </a>
        </div>
      )}
      <nav className="flex-1 overflow-auto p-2">
        <div className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-(--color-muted-foreground)">
          {t("sidebar.collections")}
        </div>
        {collections.length === 0 && (
          <div className="px-2 py-3 text-sm text-(--color-muted-foreground)">
            {t("sidebar.noCollections")}
          </div>
        )}
        <ul className="space-y-0.5">
          {collections.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <Link
                  to="/collections/$collectionId"
                  params={{ collectionId: c.id }}
                  search={{ page: 1 }}
                  onClick={onNavigate}
                  className={
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm " +
                    (active
                      ? "bg-(--color-background) text-(--color-foreground) shadow-sm"
                      : "text-(--color-muted-foreground) hover:bg-(--color-background)/60")
                  }
                >
                  <Database className="h-4 w-4 shrink-0" />
                  <span className="truncate">{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-2 border-t border-(--color-border)">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void logoutFn();
          }}
        >
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            {t("auth.logout")}
          </Button>
        </form>
      </div>
    </aside>
  );
}
