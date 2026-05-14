import { Context, Effect, Layer } from "effect";
import { ConfigError } from "../effect/errors.js";
import { isLocale, type Locale } from "../../lib/i18n.js";

export interface AppConfig {
  readonly framerApiKey: string;
  readonly framerProjectUrl: string;
  readonly authEmail: string;
  readonly authPassword: string;
  readonly cookieSecret: string;
  readonly cookieName: string;
  readonly sessionTtlSeconds: number;
  readonly appLocale: Locale;
  /** Optional override for the brand name. When unset we fall back to the Framer project name. */
  readonly appNameOverride: string | null;
  /** Optional override for the live website URL (otherwise pulled from publish info). */
  readonly websiteUrlOverride: string | null;
}

export class Config extends Context.Tag("Config")<Config, AppConfig>() {}

const required = (name: string): Effect.Effect<string, ConfigError> =>
  Effect.sync(() => process.env[name]).pipe(
    Effect.flatMap((value) =>
      value && value.length > 0
        ? Effect.succeed(value)
        : Effect.fail(new ConfigError({ message: `Missing required env var: ${name}` })),
    ),
  );

export const ConfigLive = Layer.effect(
  Config,
  Effect.gen(function* () {
    const framerApiKey = yield* required("FRAMER_API_KEY");
    const framerProjectUrl = yield* required("FRAMER_PROJECT_URL");
    const authEmail = yield* required("AUTH_EMAIL");
    const authPassword = yield* required("AUTH_PASSWORD");
    const cookieSecret = yield* required("COOKIE_SECRET");
    const rawLocale = (process.env.APP_LOCALE ?? "en").toLowerCase().trim();
    const appLocale: Locale = isLocale(rawLocale) ? rawLocale : "en";
    return {
      framerApiKey,
      framerProjectUrl,
      authEmail: authEmail.toLowerCase().trim(),
      authPassword,
      cookieSecret,
      cookieName: process.env.COOKIE_NAME ?? "framer_cms_session",
      sessionTtlSeconds: 60 * 60 * 24 * 7,
      appLocale,
      appNameOverride: process.env.APP_NAME?.trim() ? process.env.APP_NAME.trim() : null,
      websiteUrlOverride: process.env.WEBSITE_URL?.trim()
        ? process.env.WEBSITE_URL.trim()
        : null,
    };
  }),
);
