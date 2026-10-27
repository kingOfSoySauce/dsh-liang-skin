import { build } from "esbuild";
import { readFileSync } from "node:fs";

const id = "@leon___/dsh-client-liang-intensity-skin";
const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

await build({
  entryPoints: ["src/client/index.tsx"],
  outfile: "lib/client.js",
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  sourcemap: true,
  loader: { ".css": "text" },
  external: [
    "react",
    "react/jsx-runtime",
    "@deepseek-ai/dsh-client-ui-primitives",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
    "__LIANG_VERSION__": JSON.stringify(manifest.version),
  },
  banner: {
    js: `window.__ModuleLoader__.load({id:${JSON.stringify(id)},factory:(require)=>{var module={exports:{}};var exports=module.exports;`,
  },
  footer: {
    js: "return module.exports;}});",
  },
});
