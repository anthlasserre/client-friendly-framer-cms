import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FieldInput } from "./field-input";
import { saveItemFn } from "~/server/server-fns/collections";
import type { CollectionDTO, FieldValue, ItemDTO } from "~/lib/field-types";
import { useT } from "~/lib/i18n-context";

interface Props {
  collection: CollectionDTO;
  item?: ItemDTO;
}

function blankValueFor(kind: string): FieldValue {
  switch (kind) {
    case "string":
      return { kind: "string", value: "" };
    case "formattedText":
      return { kind: "formattedText", html: "" };
    case "date":
      return { kind: "date", value: null };
    case "image":
      return { kind: "image", url: null };
    default:
      return { kind: "unsupported" };
  }
}

export function ItemForm({ collection, item }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const router = useRouter();
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [draft, setDraft] = useState(item?.draft ?? false);
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {};
    for (const f of collection.fields) {
      initial[f.id] = item?.fields[f.id] ?? blankValueFor(f.kind);
    }
    return initial;
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      toast.error(t("item.slugRequired"));
      return;
    }
    setBusy(true);
    try {
      const fields = collection.fields
        .filter((f) => f.kind !== "unsupported")
        .map((f) => {
          const v = values[f.id];
          if (v.kind === "string") return { fieldId: f.id, kind: "string" as const, value: v.value };
          if (v.kind === "formattedText")
            return { fieldId: f.id, kind: "formattedText" as const, value: v.html };
          if (v.kind === "date") return { fieldId: f.id, kind: "date" as const, value: v.value };
          if (v.kind === "image")
            return { fieldId: f.id, kind: "image" as const, value: v.url, alt: v.alt };
          return null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const fd = new FormData();
      fd.append("collectionId", collection.id);
      if (item) fd.append("itemId", item.id);
      fd.append("slug", slug.trim());
      fd.append("draft", draft ? "true" : "false");
      fd.append("__fields", JSON.stringify(fields));

      await saveItemFn({ data: fd });
      toast.success(item ? t("item.updated") : t("item.created"));
      router.invalidate();
      await navigate({
        to: "/collections/$collectionId",
        params: { collectionId: collection.id },
        search: { page: 1 },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("item.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="p-4 sm:p-8 max-w-2xl space-y-6" onSubmit={onSubmit}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              to: "/collections/$collectionId",
              params: { collectionId: collection.id },
              search: { page: 1 },
            })
          }
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> {t("item.back")}
        </Button>
      </div>
      <header>
        <h1 className="text-xl sm:text-2xl font-semibold break-words">
          {item ? t("item.editTitle", { slug: item.slug }) : t("item.newTitle")}
        </h1>
        <p className="text-sm text-(--color-muted-foreground)">{collection.name}</p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="slug">
          {t("item.slug")} <span className="text-(--color-destructive)">*</span>
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>

      {collection.fields.map((f) => (
        <FieldInput
          key={f.id}
          meta={f}
          value={values[f.id] ?? blankValueFor(f.kind)}
          onChange={(next) => setValues((s) => ({ ...s, [f.id]: next }))}
          disabled={busy}
        />
      ))}

      <div className="flex items-center gap-2">
        <input
          id="draft"
          type="checkbox"
          className="h-4 w-4 rounded border-(--color-input)"
          checked={draft}
          onChange={(e) => setDraft(e.target.checked)}
          disabled={busy}
        />
        <Label htmlFor="draft" className="cursor-pointer">
          {t("item.draft")}
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={busy}>
          {busy ? t("item.saving") : item ? t("item.save") : t("item.create")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() =>
            navigate({
              to: "/collections/$collectionId",
              params: { collectionId: collection.id },
              search: { page: 1 },
            })
          }
        >
          {t("item.cancel")}
        </Button>
      </div>
    </form>
  );
}
