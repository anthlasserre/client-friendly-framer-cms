import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { AuthService } from "../services/AuthService.js";
import { CollectionsRepo, type ItemFieldInput } from "../services/CollectionsRepo.js";
import { runServer } from "../effect/runtime.js";
import type { AppError } from "../effect/errors.js";

const requireAuth = Effect.gen(function* () {
  const auth = yield* AuthService;
  const token = getCookie(auth.cookieName);
  return yield* auth.verify(token);
});

const guarded = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.flatMap(requireAuth, () => effect);

async function runOrRedirect<A, E extends AppError, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> {
  try {
    return await runServer(effect);
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 401) {
      throw redirect({ to: "/login" });
    }
    throw err;
  }
}

export const listCollectionsFn = createServerFn({ method: "GET" }).handler(async () =>
  runOrRedirect(guarded(Effect.flatMap(CollectionsRepo, (r) => r.listCollections()))),
);

export const getCollectionFn = createServerFn({ method: "GET" })
  .inputValidator((data: { collectionId: string }) => data)
  .handler(async ({ data }) =>
    runOrRedirect(guarded(Effect.flatMap(CollectionsRepo, (r) => r.getCollection(data.collectionId)))),
  );

export const listItemsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { collectionId: string }) => data)
  .handler(async ({ data }) =>
    runOrRedirect(guarded(Effect.flatMap(CollectionsRepo, (r) => r.listItems(data.collectionId)))),
  );

export const getItemFn = createServerFn({ method: "GET" })
  .inputValidator((data: { collectionId: string; itemId: string }) => data)
  .handler(async ({ data }) =>
    runOrRedirect(
      guarded(Effect.flatMap(CollectionsRepo, (r) => r.getItem(data.collectionId, data.itemId))),
    ),
  );

export const removeItemFn = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: string; itemId: string }) => data)
  .handler(async ({ data }) => {
    await runOrRedirect(
      guarded(Effect.flatMap(CollectionsRepo, (r) => r.removeItem(data.collectionId, data.itemId))),
    );
    return { ok: true as const };
  });

interface SavePayload {
  collectionId: string;
  itemId?: string;
  slug: string;
  draft?: boolean;
  fields: ReadonlyArray<ItemFieldInput>;
}

export const saveItemFn = createServerFn({ method: "POST", strict: false })
  .inputValidator((data: unknown) => {
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      const collectionId = String(data.get("collectionId") ?? "");
      const itemId = data.get("itemId") ? String(data.get("itemId")) : undefined;
      const slug = String(data.get("slug") ?? "");
      const draft = data.get("draft") === "true";
      const fieldsRaw = String(data.get("__fields") ?? "[]");
      let parsed: unknown;
      try {
        parsed = JSON.parse(fieldsRaw);
      } catch {
        parsed = [];
      }
      const arr = Array.isArray(parsed) ? (parsed as ReadonlyArray<ItemFieldInput>) : [];
      const fields = arr.map((f) => ({
        fieldId: String(f.fieldId),
        kind: f.kind,
        value: f.value ?? null,
        alt: f.alt,
      }));
      return { collectionId, itemId, slug, draft, fields } satisfies SavePayload;
    }
    return data as SavePayload;
  })
  .handler(async ({ data }) => {
    const payload = data as SavePayload;
    await runOrRedirect(
      guarded(
        Effect.flatMap(CollectionsRepo, (r) =>
          payload.itemId
            ? r.updateItem(payload.collectionId, payload.itemId, {
                slug: payload.slug,
                draft: payload.draft,
                fields: payload.fields,
              })
            : r.addItem(payload.collectionId, {
                slug: payload.slug,
                draft: payload.draft,
                fields: payload.fields,
              }),
        ),
      ),
    );
    return { ok: true as const };
  });

export const uploadImageFn = createServerFn({ method: "POST", strict: false })
  .inputValidator((data: unknown) => {
    if (typeof FormData === "undefined" || !(data instanceof FormData)) {
      throw new Error("FormData required");
    }
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("file is required");
    return { file };
  })
  .handler(async ({ data }) => {
    const file = (data as { file: File }).file;
    const buf = new Uint8Array(await file.arrayBuffer());
    return runOrRedirect(
      guarded(
        Effect.flatMap(CollectionsRepo, (r) =>
          r.uploadImage({ bytes: buf, mimeType: file.type, name: file.name }),
        ),
      ),
    );
  });
