import handler from "./dist/server/server.js";
import { resolve } from "node:path";

const clientDir = resolve("./dist/client");
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "0.0.0.0";

async function tryStatic(url) {
  const decoded = decodeURIComponent(url.pathname);
  if (decoded === "/" || decoded.endsWith("/")) return null;

  const candidate = resolve(clientDir + decoded);
  if (candidate !== clientDir && !candidate.startsWith(clientDir + "/")) {
    return null; // path traversal attempt
  }

  const file = Bun.file(candidate);
  if (!(await file.exists())) return null;

  const headers = new Headers();
  if (file.type) headers.set("content-type", file.type);
  if (decoded.startsWith("/assets/")) {
    // Vite hashes filenames in /assets, so they're safe to cache forever.
    headers.set("cache-control", "public, max-age=31536000, immutable");
  }
  return new Response(file, { headers });
}

Bun.serve({
  port,
  hostname,
  async fetch(req) {
    const url = new URL(req.url);
    const staticResponse = await tryStatic(url);
    if (staticResponse) return staticResponse;
    return handler.fetch(req);
  },
});

console.log(`Server listening on http://${hostname}:${port}`);
