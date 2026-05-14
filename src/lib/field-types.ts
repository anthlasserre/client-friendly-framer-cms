export type SupportedFieldKind = "string" | "formattedText" | "image" | "date" | "unsupported";

export interface FieldMeta {
  readonly id: string;
  readonly name: string;
  readonly kind: SupportedFieldKind;
  readonly required: boolean;
  readonly nativeType: string;
}

export interface StringFieldValue {
  readonly kind: "string";
  readonly value: string;
}

export interface FormattedTextFieldValue {
  readonly kind: "formattedText";
  readonly html: string;
}

export interface ImageFieldValue {
  readonly kind: "image";
  readonly url: string | null;
  readonly alt?: string;
}

export interface DateFieldValue {
  readonly kind: "date";
  readonly value: string | null;
}

export interface UnsupportedFieldValue {
  readonly kind: "unsupported";
  readonly preview?: string;
}

export type FieldValue =
  | StringFieldValue
  | FormattedTextFieldValue
  | ImageFieldValue
  | DateFieldValue
  | UnsupportedFieldValue;

export interface ItemDTO {
  readonly id: string;
  readonly slug: string;
  readonly draft: boolean;
  readonly fields: Record<string, FieldValue>;
}

export interface CollectionDTO {
  readonly id: string;
  readonly name: string;
  readonly slugFieldName: string | null;
  /** Field ID that the slug is derived from — usually the "title" field. */
  readonly slugFieldBasedOn: string | null;
  readonly fields: ReadonlyArray<FieldMeta>;
}

export interface CollectionSummary {
  readonly id: string;
  readonly name: string;
}

export function kindFromNative(nativeType: string): SupportedFieldKind {
  switch (nativeType) {
    case "string":
      return "string";
    case "formattedText":
      return "formattedText";
    case "image":
      return "image";
    case "date":
      return "date";
    default:
      return "unsupported";
  }
}
