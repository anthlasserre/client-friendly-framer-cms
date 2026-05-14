import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { getCollectionFn, listItemsFn, removeItemFn } from "~/server/server-fns/collections";
import type { FieldValue, ItemDTO } from "~/lib/field-types";
import { useI18n } from "~/lib/i18n-context";
import { ItemsTableSkeleton } from "~/components/skeletons";
import { ErrorScreen } from "~/components/error-screen";

const PAGE_SIZE = 20;

interface SearchParams {
  page: number;
}

export const Route = createFileRoute("/collections/$collectionId/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const raw = Number(search.page);
    const page = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
    return { page };
  },
  loader: async ({ params }) => {
    const [collection, items] = await Promise.all([
      getCollectionFn({ data: { collectionId: params.collectionId } }),
      listItemsFn({ data: { collectionId: params.collectionId } }),
    ]);
    return { collection, items };
  },
  pendingComponent: ItemsTableSkeleton,
  pendingMs: 200,
  errorComponent: ({ error, reset }) => <ErrorScreen error={error} reset={reset} />,
  component: CollectionPage,
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function findThumbnail(item: ItemDTO): string | null {
  for (const v of Object.values(item.fields)) {
    if (v.kind === "image" && v.url) return v.url;
  }
  return null;
}

function findPreviewText(
  item: ItemDTO,
  fields: ReadonlyArray<{ id: string; kind: string }>,
  excludeFieldId?: string | null,
): string {
  for (const f of fields) {
    if (f.id === excludeFieldId) continue;
    const v: FieldValue | undefined = item.fields[f.id];
    if (!v) continue;
    if (v.kind === "string" && v.value.trim()) return v.value.trim();
    if (v.kind === "formattedText") {
      const stripped = stripHtml(v.html);
      if (stripped) return stripped;
    }
  }
  return "";
}

function pickTitle(
  item: ItemDTO,
  collection: { slugFieldBasedOn: string | null; fields: ReadonlyArray<{ id: string; kind: string }> },
): { title: string; titleFieldId: string | null } {
  // Prefer the field the slug is derived from (Framer's "title" by default).
  if (collection.slugFieldBasedOn) {
    const v = item.fields[collection.slugFieldBasedOn];
    if (v?.kind === "string" && v.value.trim()) {
      return { title: v.value.trim(), titleFieldId: collection.slugFieldBasedOn };
    }
  }
  // Otherwise first non-empty string field.
  for (const f of collection.fields) {
    if (f.kind !== "string") continue;
    const v = item.fields[f.id];
    if (v?.kind === "string" && v.value.trim()) {
      return { title: v.value.trim(), titleFieldId: f.id };
    }
  }
  return { title: item.slug, titleFieldId: null };
}

function CollectionPage() {
  const { t, locale } = useI18n();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const { collection, items } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const params = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  const onDelete = async (item: ItemDTO) => {
    if (!window.confirm(t("collections.deleteConfirm", { slug: item.slug }))) return;
    try {
      await removeItemFn({ data: { collectionId: collection.id, itemId: item.id } });
      toast.success(t("collections.itemDeleted"));
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("collections.deleteFailed"));
    }
  };

  const goToPage = (next: number) => {
    void navigate({
      to: "/collections/$collectionId",
      params: { collectionId: params.collectionId },
      search: { page: next },
    });
  };

  const findDate = (item: ItemDTO): string | null => {
    for (const v of Object.values(item.fields)) {
      if (v.kind === "date" && v.value) return new Date(v.value).toLocaleDateString(dateLocale);
    }
    return null;
  };

  const countKey =
    total === 1 ? "collections.itemCount.one" : "collections.itemCount.other";

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">{collection.name}</h1>
          <p className="text-sm text-(--color-muted-foreground)">
            {t(countKey, { count: total })}
          </p>
        </div>
        <Button asChild>
          <Link
            to="/collections/$collectionId/items/new"
            params={{ collectionId: params.collectionId }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("collections.newItem")}
          </Link>
        </Button>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-(--color-border) p-12 text-center text-sm text-(--color-muted-foreground)">
          {t("collections.emptyState")}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => {
            const thumb = findThumbnail(item);
            const { title, titleFieldId } = pickTitle(item, collection);
            const showSlug = title !== item.slug;
            const preview = findPreviewText(item, collection.fields, titleFieldId);
            const date = findDate(item);
            return (
              <li key={item.id}>
                <div className="group flex items-center gap-3 sm:gap-4 rounded-lg border border-(--color-border) bg-(--color-background) p-3 transition-shadow hover:shadow-sm">
                  <Link
                    to="/collections/$collectionId/items/$itemId"
                    params={{
                      collectionId: params.collectionId,
                      itemId: item.id,
                    }}
                    className="flex flex-1 items-center gap-3 sm:gap-4 min-w-0"
                  >
                    <Thumbnail src={thumb} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium truncate">{title}</div>
                        {item.draft && (
                          <span className="shrink-0 rounded-full bg-(--color-muted) px-2 py-0.5 text-xs text-(--color-muted-foreground)">
                            {t("collections.draftBadge")}
                          </span>
                        )}
                      </div>
                      {showSlug && (
                        <div className="mt-0.5 text-xs text-(--color-muted-foreground) truncate font-mono">
                          /{item.slug}
                        </div>
                      )}
                      {preview && (
                        <div className="mt-0.5 text-sm text-(--color-muted-foreground) line-clamp-2">
                          {preview}
                        </div>
                      )}
                      {date && (
                        <div className="mt-0.5 text-xs text-(--color-muted-foreground)">
                          {date}
                        </div>
                      )}
                    </div>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item)}
                    aria-label={t("collections.deleteAria", { slug: item.slug })}
                    className="shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-(--color-border) pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => goToPage(safePage - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">{t("pagination.previous")}</span>
          </Button>
          <div className="text-sm text-(--color-muted-foreground) text-center">
            {t("pagination.pageOf", { page: safePage, total: totalPages })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => goToPage(safePage + 1)}
          >
            <span className="hidden sm:inline">{t("pagination.next")}</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Thumbnail({ src }: { src: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-14 w-14 shrink-0 rounded-md object-cover border border-(--color-border)"
      />
    );
  }
  return (
    <div className="h-14 w-14 shrink-0 rounded-md border border-(--color-border) bg-(--color-muted) grid place-items-center text-(--color-muted-foreground)">
      <ImageIcon className="h-5 w-5" />
    </div>
  );
}
