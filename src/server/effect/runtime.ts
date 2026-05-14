import { Cause, Effect, Either, Exit, Layer, ManagedRuntime } from "effect";
import { ConfigLive } from "../services/Config.js";
import { FramerClientLive } from "../services/FramerClient.js";
import { CollectionsRepoLive } from "../services/CollectionsRepo.js";
import { AuthServiceLive } from "../services/AuthService.js";
import type { AppError } from "./errors.js";

const AppLayer = Layer.mergeAll(CollectionsRepoLive, AuthServiceLive).pipe(
  Layer.provideMerge(FramerClientLive),
  Layer.provideMerge(ConfigLive),
);

type AppRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Layer.Success<typeof AppLayer>,
  Layer.Layer.Error<typeof AppLayer>
>;

let runtime: AppRuntime | null = null;

const getRuntime = (): AppRuntime => {
  if (!runtime) runtime = ManagedRuntime.make(AppLayer);
  return runtime;
};

export class AppErrorResponse extends Error {
  readonly status: number;
  readonly tag: string;
  constructor(error: AppError) {
    const tag: string = error._tag;
    const status =
      tag === "AuthError"
        ? 401
        : tag === "NotFoundError"
          ? 404
          : tag === "ValidationError"
            ? 400
            : 500;
    const message =
      "message" in error
        ? (error as { message: string }).message
        : `${tag} (${(error as { resource: string; id: string }).resource}:${(error as { id: string }).id})`;
    super(message);
    this.status = status;
    this.tag = tag;
  }
}

export const runServer = async <A, E extends AppError, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> => {
  const rt = getRuntime() as unknown as ManagedRuntime.ManagedRuntime<R, never>;
  const exit = await rt.runPromiseExit(Effect.either(effect));
  if (Exit.isFailure(exit)) {
    const defect = Cause.squash(exit.cause);
    throw defect instanceof Error ? defect : new Error(String(defect));
  }
  const either = exit.value;
  if (Either.isLeft(either)) {
    throw new AppErrorResponse(either.left);
  }
  return either.right;
};
