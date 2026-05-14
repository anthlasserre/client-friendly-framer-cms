import { createFileRoute } from "@tanstack/react-router";
import { useT } from "~/lib/i18n-context";

export const Route = createFileRoute("/collections/")({
  component: CollectionsEmpty,
});

function CollectionsEmpty() {
  const t = useT();
  return (
    <div className="h-full grid place-items-center p-6 sm:p-12 text-center">
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg sm:text-xl font-semibold">{t("collections.empty.title")}</h2>
        <p className="text-sm text-(--color-muted-foreground)">
          {t("collections.empty.description")}
        </p>
      </div>
    </div>
  );
}
