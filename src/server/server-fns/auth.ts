import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { AuthService, type Session } from "../services/AuthService.js";
import { Config } from "../services/Config.js";
import { CollectionsRepo } from "../services/CollectionsRepo.js";
import { runServer } from "../effect/runtime.js";
import type { Locale } from "../../lib/i18n.js";

export interface AppMeta {
  locale: Locale;
  appName: string;
  websiteUrl: string | null;
}

let cachedProjectName: string | null = null;
let cachedWebsiteUrl: string | null | undefined = undefined; // undefined = not fetched

export const getAppMetaFn = createServerFn({ method: "GET" }).handler(async (): Promise<AppMeta> => {
  return runServer(
    Effect.gen(function* () {
      const config = yield* Config;
      const repo = yield* CollectionsRepo;

      let appName = config.appNameOverride;
      if (!appName) {
        if (cachedProjectName) {
          appName = cachedProjectName;
        } else {
          appName = yield* repo.getProjectName().pipe(
            Effect.catchAll(() => Effect.succeed("CMS")),
          );
          cachedProjectName = appName;
        }
      }

      let websiteUrl: string | null = config.websiteUrlOverride;
      if (!websiteUrl) {
        if (cachedWebsiteUrl !== undefined) {
          websiteUrl = cachedWebsiteUrl;
        } else {
          websiteUrl = yield* repo.getWebsiteUrl().pipe(
            Effect.catchAll(() => Effect.succeed<string | null>(null)),
          );
          cachedWebsiteUrl = websiteUrl;
        }
      }

      return { locale: config.appLocale, appName, websiteUrl };
    }),
  );
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => {
    if (!data || typeof data.email !== "string" || typeof data.password !== "string") {
      throw new Error("Email and password are required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { token, cookie } = await runServer(
      Effect.gen(function* () {
        const auth = yield* AuthService;
        const token = yield* auth.login(data.email, data.password);
        return {
          token,
          cookie: { name: auth.cookieName, maxAge: auth.cookieMaxAge },
        };
      }),
    );
    setCookie(cookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: cookie.maxAge,
    });
    return { ok: true as const };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const cookieName = await runServer(
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return auth.cookieName;
    }),
  );
  deleteCookie(cookieName, { path: "/" });
  throw redirect({ to: "/login" });
});

export const getSessionFn = createServerFn({ method: "GET" }).handler(async (): Promise<
  Session | null
> => {
  try {
    return await runServer(
      Effect.gen(function* () {
        const auth = yield* AuthService;
        const token = getCookie(auth.cookieName);
        return yield* auth.verify(token);
      }),
    );
  } catch {
    return null;
  }
});

export const requireSessionFn = createServerFn({ method: "GET" }).handler(async (): Promise<Session> => {
  try {
    return await runServer(
      Effect.gen(function* () {
        const auth = yield* AuthService;
        const token = getCookie(auth.cookieName);
        return yield* auth.verify(token);
      }),
    );
  } catch {
    throw redirect({ to: "/login" });
  }
});
