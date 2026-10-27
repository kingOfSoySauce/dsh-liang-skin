import type { IncomingMessage, ServerResponse, RequestListener } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { Writable } from "node:stream";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apply, ASSET_PREFIX } from "./index.js";
import { parseSingleRange } from "./range.js";

describe("Liang media range parser", () => {
  it("accepts closed, open, and suffix ranges", () => {
    expect(parseSingleRange("bytes=10-19", 100)).toEqual({ start: 10, end: 19 });
    expect(parseSingleRange("bytes=90-", 100)).toEqual({ start: 90, end: 99 });
    expect(parseSingleRange("bytes=-10", 100)).toEqual({ start: 90, end: 99 });
  });

  it("rejects malformed, multi-part, and unsatisfiable ranges", () => {
    expect(parseSingleRange("bytes=0-1,4-5", 100)).toBe(false);
    expect(parseSingleRange("items=0-4", 100)).toBe(false);
    expect(parseSingleRange("bytes=100-", 100)).toBe(false);
    expect(parseSingleRange(undefined, 100)).toBe(null);
  });
});

describe("Liang portrait asset routes", () => {
  const routes = new Map<string, { kind: string; handler: RequestListener }>();
  const directories = ["portrait-source-v2", "portrait-source-xianxia-v2"];
  let dispose: () => void;

  beforeAll(() => {
    apply({
      effect(run: () => () => void) { dispose = run(); },
      webServer: {
        register(route: { kind: string; path: string; handler: RequestListener }) {
          routes.set(route.path, route);
          return () => routes.delete(route.path);
        },
      },
    });
  });

  afterAll(() => {
    dispose?.();
    expect(routes.size).toBe(0);
  });

  const get = (path: string, options: { method?: string; headers?: Record<string, string> } = {}) =>
    new Promise<{ status: number; headers: Record<string, string>; body: Buffer }>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let status: number;
      let headers: Record<string, string>;
      const response = Object.assign(new Writable({
        write(chunk, _encoding, callback) { chunks.push(Buffer.from(chunk)); callback(); },
      }), {
        headersSent: false,
        writeHead(code: number, values: Record<string, string>) {
          status = code;
          headers = Object.fromEntries(Object.entries(values).map(([key, value]) => [key.toLowerCase(), value]));
          this.headersSent = true;
        },
      });
      response.once("finish", () => resolve({ status, headers, body: Buffer.concat(chunks) }));
      response.once("error", reject);
      const request = {
        url: path,
        method: options.method ?? "GET",
        headers: Object.fromEntries(Object.entries(options.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])),
      };
      // Exercise the actual shared handler with real filesystem streams, even
      // for URLs the host's exact-route dispatch would reject first.
      routes.values().next().value!.handler(request as IncomingMessage, response as unknown as ServerResponse);
    });

  it("serves all 48 bundled portraits as exact WebP routes with their original bytes", async () => {
    expect(routes.size).toBe(48);
    for (const directory of directories) {
      const folder = new URL(`../assets/${directory}/`, import.meta.url);
      const files = readdirSync(folder).filter(file => file.endsWith(".webp"));
      expect(files).toHaveLength(24);
      for (const file of files) {
        const path = `${ASSET_PREFIX}${directory}/${file}`;
        expect(routes.get(path)?.kind).toBe("exact");
        const result = await get(path);
        const bytes = readFileSync(new URL(file, folder));
        expect(result.status).toBe(200);
        expect(result.headers["content-type"]).toBe("image/webp");
        expect(result.headers["content-length"]).toBe(String(bytes.length));
        expect(result.headers["x-content-type-options"]).toBe("nosniff");
        expect(result.body.equals(bytes), path).toBe(true);
      }
    }
  });

  it.each(directories)("preserves HEAD, cache validation and byte ranges for %s", async directory => {
    const path = `${ASSET_PREFIX}${directory}/stage-00.webp`;
    const bytes = readFileSync(new URL(`../assets/${directory}/stage-00.webp`, import.meta.url));
    const head = await get(path, { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(head.body.length).toBe(0);
    expect(head.headers["content-type"]).toBe("image/webp");
    expect(head.headers["content-length"]).toBe(String(bytes.length));
    expect(head.headers["accept-ranges"]).toBe("bytes");
    expect(head.headers["cache-control"]).toBe("private, max-age=3600, must-revalidate");
    expect(head.headers.etag).toEqual(expect.any(String));
    const cached = await get(path, { headers: { "If-None-Match": head.headers.etag! } });
    expect(cached.status).toBe(304);
    expect(cached.body.length).toBe(0);
    expect(cached.headers.etag).toBe(head.headers.etag);

    const partial = await get(path, { headers: { Range: "bytes=10-19", "If-Range": head.headers.etag! } });
    expect(partial.status).toBe(206);
    expect(partial.headers["content-range"]).toBe(`bytes 10-19/${bytes.length}`);
    expect(partial.body).toEqual(bytes.subarray(10, 20));
    const headRange = await get(path, { method: "HEAD", headers: { Range: "bytes=-10" } });
    expect(headRange.status).toBe(206);
    expect(headRange.headers["content-length"]).toBe("10");
    expect(headRange.body.length).toBe(0);
    const suffix = await get(path, { headers: { Range: "bytes=-10" } });
    expect(suffix.status).toBe(206);
    expect(suffix.body).toEqual(bytes.subarray(-10));
    const stale = await get(path, { headers: { Range: "bytes=10-19", "If-Range": "outdated" } });
    expect(stale.status).toBe(200);
    expect(stale.body.equals(bytes)).toBe(true);
    const invalid = await get(path, { headers: { Range: `bytes=${bytes.length}-` } });
    expect(invalid.status).toBe(416);
    expect(invalid.headers["content-range"]).toBe(`bytes */${bytes.length}`);
  });

  it("rejects non-whitelisted paths and unsupported methods", async () => {
    for (const path of [
      `${ASSET_PREFIX}portrait-source-other/stage-00.webp`,
      `${ASSET_PREFIX}portrait-source-xianxia-v2/not-bundled.webp`,
      `${ASSET_PREFIX}portrait-source-v2/../../src/index.js`,
      `${ASSET_PREFIX}portrait-source-v2/%2e%2e/%2e%2e/package.json`,
      `${ASSET_PREFIX}portrait-source-v2/%2e%2e%2f%2e%2e%2fpackage.json`,
      `${ASSET_PREFIX}../package.json`,
    ]) {
      const result = await get(path);
      expect(result.status, path).toBe(404);
      expect(result.body.length).toBe(0);
    }
    const post = await get(`${ASSET_PREFIX}portrait-source-v2/stage-00.webp`, { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.allow).toBe("GET, HEAD");
  });
});
