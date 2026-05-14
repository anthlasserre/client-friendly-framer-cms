import { Context, Effect, Layer } from "effect";
import type {
  CollectionItem,
  Field,
  FieldDataEntryInput,
  FieldDataInput,
} from "framer-api";
import { FramerClient } from "./FramerClient.js";
import { FramerError, NotFoundError } from "../effect/errors.js";
import {
  type CollectionDTO,
  type CollectionSummary,
  type FieldMeta,
  type FieldValue,
  type ItemDTO,
  kindFromNative,
} from "../../lib/field-types.js";

export interface ItemFieldInput {
  readonly fieldId: string;
  readonly kind: "string" | "formattedText" | "image" | "date";
  /** For string/formattedText/date: the raw value. For image: an uploaded URL. */
  readonly value: string | null;
  readonly alt?: string;
}

export interface SaveItemInput {
  readonly slug: string;
  readonly draft?: boolean;
  readonly fields: ReadonlyArray<ItemFieldInput>;
}

export interface CollectionsRepoService {
  readonly listCollections: () => Effect.Effect<ReadonlyArray<CollectionSummary>, FramerError>;
  readonly getCollection: (
    collectionId: string,
  ) => Effect.Effect<CollectionDTO, FramerError | NotFoundError>;
  readonly listItems: (
    collectionId: string,
  ) => Effect.Effect<ReadonlyArray<ItemDTO>, FramerError | NotFoundError>;
  readonly getItem: (
    collectionId: string,
    itemId: string,
  ) => Effect.Effect<ItemDTO, FramerError | NotFoundError>;
  readonly addItem: (
    collectionId: string,
    input: SaveItemInput,
  ) => Effect.Effect<void, FramerError | NotFoundError>;
  readonly updateItem: (
    collectionId: string,
    itemId: string,
    input: SaveItemInput,
  ) => Effect.Effect<void, FramerError | NotFoundError>;
  readonly removeItem: (
    collectionId: string,
    itemId: string,
  ) => Effect.Effect<void, FramerError | NotFoundError>;
  readonly uploadImage: (input: {
    bytes: Uint8Array<ArrayBuffer>;
    mimeType: string;
    name?: string;
  }) => Effect.Effect<{ url: string; id: string }, FramerError>;
  readonly getProjectName: () => Effect.Effect<string, FramerError>;
  readonly getWebsiteUrl: () => Effect.Effect<string | null, FramerError>;
}

export class CollectionsRepo extends Context.Tag("CollectionsRepo")<
  CollectionsRepo,
  CollectionsRepoService
>() {}

const fieldMetaFromSdk = (field: Field): FieldMeta => ({
  id: field.id,
  name: field.name,
  nativeType: field.type,
  kind: kindFromNative(field.type),
  required: "required" in field ? Boolean((field as { required?: boolean }).required) : false,
});

const sdkValueToFieldValue = (
  meta: FieldMeta,
  entry: unknown,
): FieldValue => {
  if (!entry || typeof entry !== "object") {
    return meta.kind === "string"
      ? { kind: "string", value: "" }
      : meta.kind === "formattedText"
        ? { kind: "formattedText", html: "" }
        : meta.kind === "date"
          ? { kind: "date", value: null }
          : meta.kind === "image"
            ? { kind: "image", url: null }
            : {
                kind: "unsupported",
                preview: typeof entry === "object" ? JSON.stringify(entry).slice(0, 80) : String(entry),
              };
  }
  const e = entry as { type?: string; value?: unknown; alt?: string };
  switch (meta.kind) {
    case "string":
      return { kind: "string", value: typeof e.value === "string" ? e.value : "" };
    case "formattedText":
      return { kind: "formattedText", html: typeof e.value === "string" ? e.value : "" };
    case "date":
      return { kind: "date", value: typeof e.value === "string" ? e.value : null };
    case "image": {
      const v = e.value as { url?: string } | undefined;
      return { kind: "image", url: v?.url ?? null, alt: e.alt };
    }
    default:
      return {
        kind: "unsupported",
        preview: typeof entry === "object" ? JSON.stringify(entry).slice(0, 80) : String(entry),
      };
  }
};

const itemToDto = (item: CollectionItem, fields: ReadonlyArray<FieldMeta>): ItemDTO => {
  const data = item.fieldData as Record<string, unknown>;
  const fieldValues: Record<string, FieldValue> = {};
  for (const meta of fields) {
    fieldValues[meta.id] = sdkValueToFieldValue(meta, data[meta.id]);
  }
  return {
    id: item.id,
    slug: item.slug,
    draft: item.draft,
    fields: fieldValues,
  };
};

const buildFieldDataInput = (
  fields: ReadonlyArray<FieldMeta>,
  input: SaveItemInput,
): FieldDataInput => {
  const fieldsById = new Map(fields.map((f) => [f.id, f]));
  const out: Record<string, FieldDataEntryInput> = {};
  for (const f of input.fields) {
    const meta = fieldsById.get(f.fieldId);
    if (!meta) continue;
    switch (f.kind) {
      case "string":
        out[f.fieldId] = { type: "string", value: f.value ?? "" };
        break;
      case "formattedText":
        out[f.fieldId] = { type: "formattedText", value: f.value ?? "", contentType: "html" };
        break;
      case "date":
        out[f.fieldId] = { type: "date", value: f.value };
        break;
      case "image":
        out[f.fieldId] = { type: "image", value: f.value, alt: f.alt };
        break;
    }
  }
  return out;
};

export const CollectionsRepoLive = Layer.effect(
  CollectionsRepo,
  Effect.gen(function* () {
    const framerClient = yield* FramerClient;

    const fetchCollection = (collectionId: string) =>
      framerClient.use(async (framer) => {
        const collections = await framer.getCollections();
        const found = collections.find((c) => c.id === collectionId);
        if (!found) return null;
        return found;
      });

    const requireCollection = (collectionId: string) =>
      Effect.flatMap(fetchCollection(collectionId), (c) =>
        c
          ? Effect.succeed(c)
          : Effect.fail(new NotFoundError({ resource: "collection", id: collectionId })),
      );

    return CollectionsRepo.of({
      listCollections: () =>
        framerClient.use(async (framer) => {
          const collections = await framer.getCollections();
          return collections
            .filter((c) => c.managedBy === "user")
            .map((c) => ({ id: c.id, name: c.name }));
        }),

      getCollection: (collectionId) =>
        Effect.gen(function* () {
          const collection = yield* requireCollection(collectionId);
          const fields = yield* framerClient.use((_framer) => collection.getFields());
          return {
            id: collection.id,
            name: collection.name,
            slugFieldName: collection.slugFieldName,
            slugFieldBasedOn: collection.slugFieldBasedOn,
            fields: fields.map(fieldMetaFromSdk),
          };
        }),

      listItems: (collectionId) =>
        Effect.gen(function* () {
          const collection = yield* requireCollection(collectionId);
          const [items, fields] = yield* framerClient.use(async (_framer) => {
            const [i, f] = await Promise.all([collection.getItems(), collection.getFields()]);
            return [i, f] as const;
          });
          const fieldMetas = fields.map(fieldMetaFromSdk);
          return items.map((item) => itemToDto(item, fieldMetas));
        }),

      getItem: (collectionId, itemId) =>
        Effect.gen(function* () {
          const collection = yield* requireCollection(collectionId);
          const [items, fields] = yield* framerClient.use(async (_framer) => {
            const [i, f] = await Promise.all([collection.getItems(), collection.getFields()]);
            return [i, f] as const;
          });
          const item = items.find((x) => x.id === itemId);
          if (!item) {
            return yield* Effect.fail(new NotFoundError({ resource: "item", id: itemId }));
          }
          return itemToDto(item, fields.map(fieldMetaFromSdk));
        }),

      addItem: (collectionId, input) =>
        Effect.gen(function* () {
          const collection = yield* requireCollection(collectionId);
          const fields = yield* framerClient.use((_framer) => collection.getFields());
          const fieldData = buildFieldDataInput(fields.map(fieldMetaFromSdk), input);
          yield* framerClient.use((_framer) =>
            collection.addItems([
              { slug: input.slug, draft: input.draft, fieldData },
            ]),
          );
        }),

      updateItem: (collectionId, itemId, input) =>
        Effect.gen(function* () {
          const collection = yield* requireCollection(collectionId);
          const fields = yield* framerClient.use((_framer) => collection.getFields());
          const fieldData = buildFieldDataInput(fields.map(fieldMetaFromSdk), input);
          yield* framerClient.use((_framer) =>
            collection.addItems([
              { id: itemId, slug: input.slug, draft: input.draft, fieldData },
            ]),
          );
        }),

      removeItem: (collectionId, itemId) =>
        Effect.gen(function* () {
          const collection = yield* requireCollection(collectionId);
          yield* framerClient.use((_framer) => collection.removeItems([itemId]));
        }),

      uploadImage: ({ bytes, mimeType, name }) =>
        framerClient.use(async (framer) => {
          const asset = await framer.uploadImage({
            image: { bytes, mimeType },
            name,
          });
          return { url: asset.url, id: asset.id };
        }),

      getProjectName: () =>
        framerClient.use(async (framer) => {
          const info = await framer.getProjectInfo();
          return info.name;
        }),

      getWebsiteUrl: () =>
        framerClient.use(async (framer) => {
          const info = await framer.getPublishInfo();
          return info.production?.url ?? info.staging?.url ?? null;
        }),
    });
  }),
);
