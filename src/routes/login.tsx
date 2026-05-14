import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { getSessionFn, loginFn } from "~/server/server-fns/auth";
import { useT } from "~/lib/i18n-context";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session) throw redirect({ to: "/collections" });
  },
  component: LoginPage,
});

function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loginFn({ data: { email, password } });
      toast.success(t("auth.welcomeBack"));
      await navigate({ to: "/collections" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "Invalid email or password") {
        toast.error(t("auth.invalidCredentials"));
      } else {
        toast.error(msg || t("auth.loginFailed"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-(--color-muted)">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.signInTitle")}</CardTitle>
          <CardDescription>{t("auth.signInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
