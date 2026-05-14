import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "~/components/sidebar";
import { Sheet, SheetContent, SheetTitle } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { useI18n } from "~/lib/i18n-context";
import { requireSessionFn } from "~/server/server-fns/auth";
import { listCollectionsFn } from "~/server/server-fns/collections";
import { CollectionsShellSkeleton } from "~/components/skeletons";
import { ErrorScreen } from "~/components/error-screen";

export const Route = createFileRoute("/collections")({
  beforeLoad: async () => {
    await requireSessionFn();
  },
  loader: async () => {
    const [session, collections] = await Promise.all([requireSessionFn(), listCollectionsFn()]);
    return { session, collections };
  },
  pendingComponent: CollectionsShellSkeleton,
  pendingMs: 200,
  errorComponent: ({ error, reset }) => <ErrorScreen error={error} reset={reset} />,
  component: CollectionsLayout,
});

function CollectionsLayout() {
  const { collections, session } = Route.useLoaderData();
  const params = useParams({ strict: false }) as { collectionId?: string };
  const { t, appName } = useI18n();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between gap-2 border-b border-(--color-border) bg-(--color-background) px-3 py-2 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("sidebar.collections")}
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-sm font-semibold truncate">{appName}</div>
        <div className="w-9" />
      </header>

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collections={collections}
          activeId={params.collectionId}
          email={session.email}
        />
      </div>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[80vw] max-w-72">
          <SheetTitle className="sr-only">{t("sidebar.collections")}</SheetTitle>
          <Sidebar
            collections={collections}
            activeId={params.collectionId}
            email={session.email}
            onNavigate={close}
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
