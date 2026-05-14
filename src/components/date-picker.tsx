import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { enUS, fr as frLocale } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "~/lib/cn";
import { useI18n } from "~/lib/i18n-context";

interface Props {
  value: string | null;
  onChange: (next: string | null) => void;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, disabled }: Props) {
  const { locale, t } = useI18n();
  const dfnsLocale = locale === "fr" ? frLocale : enUS;
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;
  const label = selected ? format(selected, "PPP", { locale: dfnsLocale }) : t("date.pick");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-(--color-muted-foreground)",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          locale={dfnsLocale}
          selected={selected}
          onSelect={(d) => {
            onChange(d ? d.toISOString() : null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
