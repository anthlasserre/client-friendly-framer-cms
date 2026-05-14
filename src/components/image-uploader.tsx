import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { uploadImageFn } from "~/server/server-fns/collections";
import { useT } from "~/lib/i18n-context";

interface Props {
  value: string | null;
  alt?: string;
  onChange: (next: { url: string | null; alt?: string }) => void;
  disabled?: boolean;
}

export function ImageUploader({ value, alt, onChange, disabled }: Props) {
  const t = useT();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pickFile = () => ref.current?.click();

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const asset = (await uploadImageFn({ data: fd as unknown as never })) as {
        url: string;
        id: string;
      };
      onChange({ url: asset.url, alt });
      toast.success(t("image.uploaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("image.uploadFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt={alt ?? ""}
            className="h-20 w-20 rounded-md object-cover border border-(--color-border)"
          />
        ) : (
          <div className="h-20 w-20 rounded-md border border-dashed border-(--color-border) flex items-center justify-center text-(--color-muted-foreground) text-xs">
            {t("image.noImage")}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            onClick={pickFile}
          >
            <Upload className="mr-2 h-4 w-4" />
            {busy ? t("image.uploading") : value ? t("image.replace") : t("image.upload")}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || busy}
              onClick={() => onChange({ url: null, alt: undefined })}
            >
              <X className="mr-2 h-4 w-4" />
              {t("image.remove")}
            </Button>
          )}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
