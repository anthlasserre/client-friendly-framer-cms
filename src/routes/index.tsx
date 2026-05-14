import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionFn } from "~/server/server-fns/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session) throw redirect({ to: "/login" });
    throw redirect({ to: "/collections" });
  },
});
