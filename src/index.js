import { createReadStream, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseSingleRange } from "./range.js";

export { parseSingleRange } from "./range.js";

export const PACKAGE_ID = "dsh-client-liang-intensity-skin";
export const SETTINGS_NAMESPACE = "liang-intensity-skin";
export const ASSET_PREFIX = `/plugins/${PACKAGE_ID}/assets/`;

const PORTRAIT_FILES = [
  "stage-00.webp", "level-01.webp", "level-03.webp", "level-04.webp",
  "stage-06.webp", "level-07.webp", "level-09.webp", "level-10.webp",
  "stage-12.webp", "level-13.webp", "level-14.webp", "bridge-15.webp",
  "level-16.webp", "level-17.webp", "stage-18.webp", "level-19.webp",
  "level-21.webp", "level-22.webp", "stage-24.webp", "level-25.webp",
  "bridge-27.webp", "level-28.webp", "level-29.webp", "stage-30.webp",
];
const ASSET_SPECS = ["portrait-source-v2", "portrait-source-xianxia-v2"].flatMap(
  (directory) => PORTRAIT_FILES.map((file) => [`${directory}/${file}`, "image/webp"]),
);

function send(res, status, headers = {}) {
  res.writeHead(status, {
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end();
}

function buildAssets() {
  const assetDirectory = fileURLToPath(new URL("../assets/", import.meta.url));
  const assets = new Map();
  for (const [name, type] of ASSET_SPECS) {
    const path = fileURLToPath(new URL(`../assets/${name}`, import.meta.url));
    try {
      const info = statSync(path);
      if (!info.isFile()) continue;
      assets.set(`${ASSET_PREFIX}${name}`, {
        path,
        type,
        size: info.size,
        etag: `W/\"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}\"`,
      });
    } catch {
      // A missing optional medium is handled by the browser fallback chain.
    }
  }
  return { assetDirectory, assets };
}

function createAssetHandler(assets, activeStreams) {
  return (req, res) => {
    const method = req.method ?? "GET";
    if (method !== "GET" && method !== "HEAD") {
      send(res, 405, { Allow: "GET, HEAD" });
      return;
    }

    let pathname;
    try {
      pathname = new URL(req.url ?? "/", "http://dsh.local").pathname;
    } catch {
      send(res, 404);
      return;
    }
    const asset = assets.get(pathname);
    if (asset === undefined) {
      send(res, 404);
      return;
    }

    if (req.headers["if-none-match"] === asset.etag) {
      send(res, 304, { ETag: asset.etag });
      return;
    }

    const ifRange = req.headers["if-range"];
    const rangeHeader = ifRange !== undefined && ifRange !== asset.etag
      ? undefined
      : req.headers.range;
    const range = parseSingleRange(rangeHeader, asset.size);
    if (range === false) {
      send(res, 416, { "Content-Range": `bytes */${asset.size}` });
      return;
    }

    const start = range?.start ?? 0;
    const end = range?.end ?? asset.size - 1;
    const status = range === null ? 200 : 206;
    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600, must-revalidate",
      "Content-Length": String(end - start + 1),
      "Content-Type": asset.type,
      ETag: asset.etag,
      ...(range === null ? {} : { "Content-Range": `bytes ${start}-${end}/${asset.size}` }),
    };

    if (method === "HEAD") {
      send(res, status, headers);
      return;
    }

    res.writeHead(status, {
      "X-Content-Type-Options": "nosniff",
      ...headers,
    });
    const stream = createReadStream(asset.path, { start, end });
    activeStreams.add(stream);
    const release = () => activeStreams.delete(stream);
    stream.once("close", release);
    stream.once("end", release);
    stream.once("error", () => {
      release();
      if (!res.headersSent) send(res, 500);
      else res.destroy();
    });
    res.once("close", () => {
      if (!stream.destroyed) stream.destroy();
    });
    stream.pipe(res);
  };
}

export const inject = ["webServer"];

export function apply(ctx) {
  const { assets } = buildAssets();
  const activeStreams = new Set();
  ctx.effect(() => {
    const handler = createAssetHandler(assets, activeStreams);
    const unregister = [...assets.keys()].map((path) => ctx.webServer.register({
      kind: "exact",
      path,
      handler,
    }));
    return () => {
      for (const dispose of unregister) dispose();
      for (const stream of activeStreams) stream.destroy();
      activeStreams.clear();
    };
  }, "liang-intensity-skin: static media route");
}
