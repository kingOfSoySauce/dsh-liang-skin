// Dev loop for the Liang skin client bundle.
//
// esbuild writes through a temp file, then this script atomically renames it
// over lib/client.js. DSH's client HMR polls lib/client.js and fetches the
// bundle as soon as it changes, so a direct write can be read half-finished:
// the plugin is torn down, the import fails, and there is no rollback.
//
// Usage:
//   node scripts/dev.mjs           build once, then exit
//   node scripts/dev.mjs --watch   rebuild on change until Ctrl+C
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, renameSync, statSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stage = join(root, "lib", ".dev");
const outfile = join(stage, "client.js");
const outmap = join(stage, "client.js.map");
const finalfile = join(root, "lib", "client.js");
const finalmap = join(root, "lib", "client.js.map");
const id = "@leon___/dsh-client-liang-intensity-skin";
const watchMode = process.argv.includes("--watch");
const require = createRequire(import.meta.url);

mkdirSync(stage, { recursive: true });

const args = [
  "src/client/index.tsx",
  "--bundle",
  `--outfile=${outfile}`,
  "--format=cjs",
  "--platform=browser",
  "--target=es2022",
  "--jsx=automatic",
  "--sourcemap",
  "--loader:.css=text",
  "--external:react",
  "--external:react/jsx-runtime",
  "--external:@deepseek-ai/dsh-client-ui-primitives",
  '--define:process.env.NODE_ENV="production"',
  `--banner:js=window.__ModuleLoader__.load({id:${JSON.stringify(id)},factory:(require)=>{var module={exports:{}};var exports=module.exports;`,
  "--footer:js=return module.exports;}});",
  "--log-level=info",
];
if (watchMode) args.push("--watch=forever");

let publishing = false;

function stat(path) {
  try {
    return statSync(path);
  } catch {
    return undefined;
  }
}

function key(path) {
  const info = stat(path);
  return info === undefined ? "" : `${info.mtimeMs}:${info.size}`;
}

// Publish only after the JS and its map stop changing between two probes, so
// the swapped file is always complete.
async function publishOnce() {
  if (publishing) return false;
  const js = stat(outfile);
  if (js === undefined) return false;
  publishing = true;
  try {
    const jsKey = key(outfile);
    const mapKey = key(outmap);
    await delay(100);
    if (key(outfile) !== jsKey || key(outmap) !== mapKey) return false; // still writing
    if (existsSync(outmap)) renameSync(outmap, finalmap);
    renameSync(outfile, finalfile);
    console.log(`[dev] published lib/client.js (${js.size} bytes)`);
    return true;
  } catch (error) {
    console.error("[dev] publish failed:", error.message);
    return false;
  } finally {
    publishing = false;
  }
}

if (watchMode) {
  let timer;
  watch(stage, { persistent: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => void publishOnce(), 50);
  });
}

const bin = require.resolve("@esbuild/win32-x64/esbuild.exe");
const child = spawn(bin, args, { stdio: "inherit", cwd: root });

child.on("exit", async (code) => {
  if (watchMode) {
    process.exit(code ?? 1);
    return;
  }
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (await publishOnce()) process.exit(0);
    await delay(100);
  }
  console.error("[dev] timed out before publishing lib/client.js");
  process.exit(code ?? 1);
});
