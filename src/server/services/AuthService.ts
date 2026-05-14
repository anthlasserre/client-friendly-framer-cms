import { Context, Effect, Layer } from "effect";
import { jwtVerify, SignJWT } from "jose";
import { timingSafeEqual } from "node:crypto";
import { Config } from "./Config.js";
import { AuthError } from "../effect/errors.js";

export interface Session {
  readonly email: string;
}

export interface AuthServiceImpl {
  readonly login: (email: string, password: string) => Effect.Effect<string, AuthError>;
  readonly verify: (token: string | undefined | null) => Effect.Effect<Session, AuthError>;
  readonly cookieName: string;
  readonly cookieMaxAge: number;
}

export class AuthService extends Context.Tag("AuthService")<AuthService, AuthServiceImpl>() {}

const encoder = new TextEncoder();

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export const AuthServiceLive = Layer.effect(
  AuthService,
  Effect.gen(function* () {
    const config = yield* Config;
    const secret = encoder.encode(config.cookieSecret);
    return {
      cookieName: config.cookieName,
      cookieMaxAge: config.sessionTtlSeconds,
      login: (email, password) =>
        Effect.gen(function* () {
          const normalized = email.toLowerCase().trim();
          const emailMatches = normalized === config.authEmail;
          const passwordMatches = constantTimeEquals(password, config.authPassword);
          if (!emailMatches || !passwordMatches) {
            return yield* Effect.fail(new AuthError({ message: "Invalid email or password" }));
          }
          const token = yield* Effect.tryPromise({
            try: () =>
              new SignJWT({ sub: normalized })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime(`${config.sessionTtlSeconds}s`)
                .sign(secret),
            catch: () => new AuthError({ message: "Could not sign session" }),
          });
          return token;
        }),
      verify: (token) =>
        Effect.gen(function* () {
          if (!token) {
            return yield* Effect.fail(new AuthError({ message: "Not authenticated" }));
          }
          const result = yield* Effect.tryPromise({
            try: () => jwtVerify(token, secret),
            catch: () => new AuthError({ message: "Invalid session" }),
          });
          const sub = result.payload.sub;
          if (typeof sub !== "string") {
            return yield* Effect.fail(new AuthError({ message: "Invalid session payload" }));
          }
          return { email: sub };
        }),
    };
  }),
);
