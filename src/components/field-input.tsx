import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { DatePicker } from "./date-picker";
import { ImageUploader } from "./image-uploader";
import { RichTextEditor } from "./rich-text-editor";
import type { FieldMeta, FieldValue } from "~/lib/field-types";
import { useT } from "~/lib/i18n-context";

interface Props {
  meta: FieldMeta;
  value: FieldValue;
  onChange: (next: FieldValue) => void;
  disabled?: boolean;
}

export function FieldInput({ meta, value, onChange, disabled }: Props) {
  const t = useT();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={meta.id}>
        {meta.name}
        {meta.required && <span className="text-(--color-destructive)"> *</span>}
      </Label>
      {renderControl({ meta, value, onChange, disabled }, t)}
    </div>
  );
}

function renderControl(
  { meta, value, onChange, disabled }: Props,
  t: (key: import("~/lib/i18n").TranslationKey, params?: Record<string, string | number>) => string,
) {
  if (meta.kind === "formattedText" && value.kind === "formattedText") {
    return (
      <RichTextEditor
        value={value.html}
        disabled={disabled}
        onChange={(html) => onChange({ kind: "formattedText", html })}
      />
    );
  }
  if (meta.kind === "string" && value.kind === "string") {
    if (meta.name.toLowerCase().includes("description") || meta.name.toLowerCase().includes("body")) {
      return (
        <Textarea
          id={meta.id}
          value={value.value}
          disabled={disabled}
          onChange={(e) => onChange({ kind: "string", value: e.target.value })}
        />
      );
    }
    return (
      <Input
        id={meta.id}
        value={value.value}
        disabled={disabled}
        onChange={(e) => onChange({ kind: "string", value: e.target.value })}
      />
    );
  }
  if (meta.kind === "date" && value.kind === "date") {
    return (
      <DatePicker
        value={value.value}
        disabled={disabled}
        onChange={(v) => onChange({ kind: "date", value: v })}
      />
    );
  }
  if (meta.kind === "image" && value.kind === "image") {
    return (
      <ImageUploader
        value={value.url}
        alt={value.alt}
        disabled={disabled}
        onChange={({ url, alt }) => onChange({ kind: "image", url, alt })}
      />
    );
  }
  return (
    <div className="text-sm text-(--color-muted-foreground) italic">
      {t("item.unsupported")} <code>{meta.nativeType}</code>
    </div>
  );
}
