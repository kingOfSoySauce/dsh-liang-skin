import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const id = "dsh-client-liang-intensity-skin";

// Normalize CRLF inside text-loaded assets (skin.css): on Windows checkouts
// the file is CRLF, and esbuild would otherwise inline literal backslash-r
// escapes into the bundle's template string for every stylesheet line.
const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

const lfTextAssets = {
  name: "lf-text-assets",
  setup(build) {
    build.onLoad({ filter: new RegExp("[.]css$"), namespace: "file" }, async (args) => {
      const contents = (await readFile(args.path, "utf8")).split(CR + LF).join(LF);
      return { contents, loader: "text" };
    });
  },
};

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
  plugins: [lfTextAssets],
  external: [
    "react",
    "react/jsx-runtime",
    "@deepseek-ai/dsh-client-runtime/client",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  banner: {
    js: `window.__ModuleLoader__.load({id:${JSON.stringify(id)},factory:(require)=>{var module={exports:{}};var exports=module.exports;`,
  },
  footer: {
    js: "return module.exports;}});",
  },
});
