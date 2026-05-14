import { Data } from "effect";

export class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class FramerError extends Data.TaggedError("FramerError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
  readonly message: string;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resource: string;
  readonly id: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly issues?: ReadonlyArray<{ path: ReadonlyArray<string>; message: string }>;
}> {}

export type AppError = ConfigError | FramerError | AuthError | NotFoundError | ValidationError;
