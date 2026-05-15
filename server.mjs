import { createServer } from "node:http";
import { Readable } from "node:stream";
import handler from "./dist/server/server.js";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

const httpServer = createServer(async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] ?? "http";
    const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `${protocol}://${host}`);

    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(name, v);
      } else if (value !== undefined) {
        headers.set(name, value);
      }
    }

    const hasBody = !(req.method === "GET" || req.method === "HEAD");
    const request = new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: hasBody ? "half" : undefined,
    });

    const response = await handler.fetch(request);

    res.statusCode = response.status;
    if (response.statusText) res.statusMessage = response.statusText;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (!response.body) {
      res.end();
      return;
    }

    const reader = response.body.getReader();
    res.on("close", () => reader.cancel().catch(() => {}));
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(value)) {
        await new Promise((r) => res.once("drain", r));
      }
    }
    res.end();
  } catch (err) {
    console.error("[server]", err);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

httpServer.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
