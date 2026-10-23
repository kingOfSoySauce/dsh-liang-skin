// Generate the portrait series through the Ark image API (no browser).
//
// Reads the approved 2D frames, sends each through Seedream with an
// image-to-image prompt, and writes WebP files for the client skin.
//
// Requires ARK_API_KEY, plus PYTHON pointing at a Python with Pillow.
//   node scripts/gen-portraits.mjs --only=stage-30
//   node scripts/gen-portraits.mjs
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC_DIR = join(root, "assets", "portrait-source-v2");
const OUT_NAME = process.env.PORTRAIT_DIR ?? "portrait-source-xianxia";
const OUT_DIR = join(root, "assets", OUT_NAME);
const CONVERT = join(root, "scripts", "image-convert.py");
const MODEL = process.env.ARK_MODEL ?? "doubao-seedream-5-0-flash-260915";
const SIZE = process.env.ARK_SIZE ?? "2K";
const MAX_EDGE = Number(process.env.ARK_MAX_EDGE ?? 1536);
const CONCURRENCY = Number(process.env.ARK_CONCURRENCY ?? 3);
const PYTHON = process.env.PYTHON;
const KEY = process.env.ARK_API_KEY;
if (!KEY) throw new Error("ARK_API_KEY is not set");
if (!PYTHON) throw new Error("PYTHON is not set");

// Realistic CG, xianxia. Each frame gets a prompt for its cultivation tier,
// so low levels stay plain and only high levels grow rings, runes and light.
const STYLE_BASE = [
  "写实 CG 电影级玄幻修仙人物，纯深色虚空背景，没有山石、建筑或自然风景。",
  "真实皮肤毛孔与布料褶皱，体积光，浅景深，低饱和电影调色；",
  "不要现代文字、不要水印，不要卡通化，不要塑料感。",
  "保留参考图的人物身份、五官、眼镜、脸型与构图、机位；镜头为正面半身像。",
].join("");

const TIERS = [
  {
    max: 3,
    text: "修为：尚未入道的凡人。穿粗麻素色布衣道袍，无任何纹饰与配饰；背景近乎全黑，只有极淡的灰雾与远处一点微光；绝对不要金色圆环、不要符文篆文、不要光带、不要金色粒子；朴素、安静、克制。",
  },
  {
    max: 8,
    text: "修为：炼气期低阶修士。穿深灰蓝粗布道袍，暗纹极少，布带束腰；背景深黑，薄雾，极淡的青色灵光；不要金色圆环与篆文，最多几点微光尘埃；朴素低调。",
  },
  {
    max: 13,
    text: "修为：筑基期修士。穿深色织锦道袍，银色暗纹，玉质腰扣；背景出现若隐若现的暗金色圆环虚影，少量金色光粒；篆文不出现；仍以朴素为主。",
  },
  {
    max: 18,
    text: "修为：金丹期修士。华贵织锦法袍，金线暗纹，玉带束腰，广袖；身后金色圆环成形，边缘有细流光；空中少量金色古篆（秦篆/小篆）与光粒，云雾渐起。",
  },
  {
    max: 23,
    text: "修为：元婴期大修士。黑金法袍，广袖层叠，玉饰与暗金云纹；金色圆环明亮，光带环绕人物流动；金色篆文清晰漂浮，云雾与光粒明显，丁达尔光束斜射。",
  },
  {
    max: 27,
    text: "修为：化神/渡劫期大能。黑金仙袍多层叠穿，冕旒帝冠初现，衣袂与飘带被灵气托起；巨大金色法阵环在身后，强烈液态金光奔涌成带，密集篆文环绕，光粒如星屑。",
  },
  {
    max: 30,
    text: "修为：成圣大帝，有帝王之姿。黑金帝王仙袍，冕旒垂珠，神情威严；身后巨型金色符阵与满屏金色篆文，液态金光如江河奔涌，光粒如星海，圣光普照，气势压场。",
  },
];

const TIER_BY_LEVEL = new Map();
for (const tier of TIERS) {
  for (let level = 0; level <= tier.max; level += 1) {
    if (!TIER_BY_LEVEL.has(level)) TIER_BY_LEVEL.set(level, tier.text);
  }
}

const LEVEL_BY_NAME = {
  "stage-00": 0, "level-01": 1, "level-03": 3, "level-04": 4, "stage-06": 6,
  "level-07": 7, "level-09": 9, "level-10": 10, "stage-12": 12, "level-13": 13,
  "level-14": 14, "bridge-15": 15, "level-16": 16, "level-17": 17,
  "stage-18": 18, "level-19": 19, "level-21": 21, "level-22": 22,
  "stage-24": 24, "level-25": 25, "bridge-27": 27, "level-28": 28,
  "level-29": 29, "stage-30": 30,
};

function promptFor(name) {
  if (process.env.PORTRAIT_PROMPT) return process.env.PORTRAIT_PROMPT;
  const level = LEVEL_BY_NAME[name] ?? 0;
  const tier = TIER_BY_LEVEL.get(level) ?? TIERS[0].text;
  return `${STYLE_BASE}${tier}`;
}

const LEVELS = [
  "stage-00", "level-01", "level-03", "level-04", "stage-06", "level-07",
  "level-09", "level-10", "stage-12", "level-13", "level-14", "bridge-15",
  "level-16", "level-17", "stage-18", "level-19", "level-21", "level-22",
  "stage-24", "level-25", "bridge-27", "level-28", "level-29", "stage-30",
];

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const names = onlyArg ? onlyArg.slice("--only=".length).split(",").map((s) => s.trim()) : LEVELS;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function convert(src, dst, extra = []) {
  const result = spawnSync(PYTHON, [CONVERT, src, dst, ...extra], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`convert failed: ${result.stderr || result.stdout}`);
}

async function toPngBase64(name) {
  const png = join(OUT_DIR, ".src", `${name}.png`);
  await mkdir(dirname(png), { recursive: true });
  convert(join(SRC_DIR, `${name}.webp`), png);
  return (await readFile(png)).toString("base64");
}

async function generate(name) {
  const out = join(OUT_DIR, `${name}.webp`);
  if (await exists(out)) {
    console.log(`[skip] ${name}`);
    return;
  }
  const body = {
    model: MODEL,
    prompt: promptFor(name),
    image: `data:image/png;base64,${await toPngBase64(name)}`,
    size: SIZE,
    response_format: "b64_json",
    watermark: false,
  };
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const started = Date.now();
    try {
      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(240000),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${text.slice(0, 300)}`);
      const b64 = JSON.parse(text).data?.[0]?.b64_json;
      if (!b64) throw new Error(`no image payload: ${text.slice(0, 200)}`);
      const png = join(OUT_DIR, ".src", `${name}.png`);
      await writeFile(png, Buffer.from(b64, "base64"));
      convert(png, out, ["--max", String(MAX_EDGE), "--quality", "92"]);
      console.log(`[ok] ${name} ${((Date.now() - started) / 1000).toFixed(1)}s`);
      return;
    } catch (error) {
      console.warn(`[retry ${attempt}] ${name}: ${error.message}`);
      if (attempt === 3) throw error;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

await mkdir(join(OUT_DIR, ".src"), { recursive: true });

let cursor = 0;
let failed = 0;
async function worker() {
  while (cursor < names.length) {
    const name = names[cursor];
    cursor += 1;
    try {
      await generate(name);
    } catch (error) {
      failed += 1;
      console.error(`[fail] ${name}: ${error.message}`);
    }
  }
}

console.log(`model=${MODEL} size=${SIZE} edge=${MAX_EDGE} dir=${OUT_NAME} count=${names.length} concurrency=${CONCURRENCY}`);
await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));
if (failed > 0) {
  console.error(`${failed} frame(s) failed`);
  process.exitCode = 1;
}
