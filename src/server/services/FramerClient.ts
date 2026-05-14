import { Context, Effect, Layer } from "effect";
import { connect, type Framer } from "framer-api";
import { Config } from "./Config.js";
import { FramerError } from "../effect/errors.js";

export interface FramerClientService {
  readonly use: <A>(fn: (framer: Framer) => Promise<A>) => Effect.Effect<A, FramerError>;
}

export class FramerClient extends Context.Tag("FramerClient")<FramerClient, FramerClientService>() {}

let cached: Promise<Framer> | null = null;

const getOrConnect = (projectUrl: string, token: string): Promise<Framer> => {
  if (!cached) {
    cached = connect(projectUrl, token).catch((err) => {
      cached = null;
      throw err;
    });
  }
  return cached;
};

export const FramerClientLive = Layer.effect(
  FramerClient,
  Effect.gen(function* () {
    const config = yield* Config;
    return {
      use: <A>(fn: (framer: Framer) => Promise<A>) =>
        Effect.tryPromise({
          try: async () => {
            const framer = await getOrConnect(config.framerProjectUrl, config.framerApiKey);
            return await fn(framer);
          },
          catch: (cause) =>
            new FramerError({
              message: cause instanceof Error ? cause.message : "Framer API call failed",
              cause,
            }),
        }),
    };
  }),
);
