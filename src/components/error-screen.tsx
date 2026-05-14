import { Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useT } from "~/lib/i18n-context";

interface Props {
  error: unknown;
  reset?: () => void;
}

export function ErrorScreen({ error, reset }: Props) {
  const t = useT();
  const [showDetails, setShowDetails] = useState(false);
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";
  const stack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="min-h-screen w-full grid place-items-center bg-(--color-muted) p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-full bg-(--color-destructive)/10 grid place-items-center text-(--color-destructive)">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{t("error.title")}</h1>
          <p className="text-sm text-(--color-muted-foreground)">{t("error.description")}</p>
        </div>
        <div className="rounded-md border border-(--color-border) bg-(--color-background) text-left px-3 py-2 text-sm text-(--color-foreground)">
          <code className="break-words">{message}</code>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {reset && (
            <Button onClick={reset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("error.retry")}
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t("error.goHome")}
            </Link>
          </Button>
        </div>
        {stack && (
          <details
            open={showDetails}
            onToggle={(e) => setShowDetails((e.target as HTMLDetailsElement).open)}
            className="text-left text-xs"
          >
            <summary className="cursor-pointer text-(--color-muted-foreground) hover:text-(--color-foreground)">
              {t("error.details")}
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-(--color-border) bg-(--color-background) p-3 text-(--color-muted-foreground) whitespace-pre-wrap">
              {stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
