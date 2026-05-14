# client-friendly-framer-cms

A small web interface that lets a client edit their Framer site's CMS without
opening Framer. Single-tenant: configured per project via env vars.

## Stack

- TanStack Start (Vite, React 19, file-based routing, server functions)
- Effect — server-side services (Config, FramerClient, CollectionsRepo, AuthService)
- Framer Server API (`framer-api`) over a stateful WebSocket
- shadcn/ui-style components on Tailwind CSS v4
- `jose` signed JWT cookie sessions; credentials read from env
- Sonner toasts, Radix UI primitives

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `FRAMER_API_KEY` — created in Framer site settings → General → API keys.
- `FRAMER_PROJECT_URL` — your project URL or just its ID.
- `AUTH_EMAIL` — the single client login email.
- `AUTH_PASSWORD` — the client password (compared in constant time).
- `COOKIE_SECRET` — random 32+ char string. Generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `APP_LOCALE` (optional) — UI language. `en` (default) or `fr`. Set per
  deployment; clients can't switch it. Translations live in `src/lib/i18n.ts`.

Then:

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # strict TS check
npm run build      # production build
```

## Features

- Email/password login gating the whole app (Google login planned).
- Sidebar lists the project's unmanaged CMS collections.
- Per-collection items table with slug + a preview of the first fields.
- Item create / edit / delete forms with support for:
  - Text inputs (`string` fields, auto-Textarea for "description"/"body")
  - Date inputs (date picker, ISO output)
  - Image upload (uploaded to Framer assets via the SDK)
- Server-side validation through Effect services; tagged errors are mapped to
  HTTP statuses in `src/server/effect/runtime.ts`.

## Project layout

```
src/
  routes/           file-based routes (TanStack Router)
  components/       UI + form components (shadcn-style + Radix)
  server/
    effect/         Effect runtime + tagged errors
    services/       Config, FramerClient, CollectionsRepo, AuthService
    server-fns/     TanStack Start server fns wrapping the services
  lib/              Cross-cutting: cn, field-types
  styles/           Tailwind entry
```

## Notes & known limitations

- Targets **unmanaged** collections (collections users created in Framer). Managed
  collections owned by other plugins are filtered out and remain read-only.
- Item updates call `addItems([{ id, … }])` which performs an upsert when the
  id matches — IDs are preserved.
- Image upload goes through `framer.uploadImage` and stores the returned asset URL.
- No Publish button in v1 — Framer publishes CMS changes automatically when the
  project is published. Add a manual publish flow if needed by calling
  `framer.publish*` methods in `CollectionsRepo`.
