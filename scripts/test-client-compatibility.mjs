import assert from "node:assert/strict";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { build } from "esbuild";
import { chromium } from "playwright-core";

// Self-contained host contracts; native Desktop acceptance remains manual.
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const viewport = { width: 1100, height: 700 };
const css = await readFile(new URL("../src/client/skin.css", import.meta.url), "utf8");
const compiled = await build({ absWorkingDir: projectRoot,
  stdin: { resolveDir: projectRoot, contents: `
    export { paletteForFrame, PREVIEW_MAX_FRAME } from './src/client/logic.ts';
  ` },
  bundle: true, write: false, format: "iife", globalName: "LiangPalette", platform: "browser", target: "es2022" });

async function chromeExecutable() {
  const explicit = process.env.CHROME_PATH;
  const candidates = explicit ? [explicit] : [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium",
    "/usr/bin/chromium-browser", "/opt/google/chrome/chrome",
  ];
  for (const candidate of candidates) {
    try { await access(candidate, constants.X_OK); return candidate; }
    catch { /* Use an existing local browser, never download one. */ }
  }
  throw new Error(`Chrome was not found. Set CHROME_PATH to an installed Chrome/Chromium executable. Checked: ${candidates.join(", ")}`);
}

const portrait = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="rgb(32,208,96)"/></svg>')}`;
function fixture({ desktop = false, top = 0, windows = false, mode = "compatibility" } = {}) {
  return `<!doctype html><html lang="zh-CN" ${desktop ? `data-platform="${windows ? "win32" : "darwin"}"` : ""} ${windows ? 'data-windows-titlebar=""' : ""}>
  <head><meta charset="utf-8"><style>
    * { box-sizing: border-box; transition: none !important; animation: none !important; }
    html, body { margin: 0; min-height: 100vh; }
    body { --dsw-alias-bg-base: rgb(240,244,248); --dsw-specific-sidebar-fill: rgb(11,29,49);
      --liang-page: rgb(240,244,248); --liang-bg-base: rgba(0, 0, 0, 0.25);
      --liang-mask-base: rgba(0, 0, 0, 0.25); --liang-mask-strong: rgba(0, 0, 0, 0.46);
      --liang-mask-soft: rgba(0, 0, 0, 0.2); --liang-portrait-opacity: 1;
      --liang-sidebar: rgb(11,29,49); --liang-ink: rgb(20,25,30); --liang-secondary: rgb(55,60,65);
      --liang-border: rgb(100,110,120); --liang-layer-1: white; --dsh-desktop-frame-height: ${top}px;
      background: rgb(240,244,248); }
    #root { position: ${desktop ? "fixed" : "static"}; ${desktop ? `inset: ${top}px 0 0;` : ""}
      height: ${desktop ? `calc(100vh - ${top}px)` : "100vh"}; z-index: auto; background: var(--dsw-alias-bg-base); }
    .fixture_frame { display: flex; height: 100%; ${windows ? "background: var(--dsw-specific-sidebar-fill);" : ""} }
    .fixture_sidebarCol { flex: 0 0 200px; background: var(--dsw-specific-sidebar-fill); }
    .fixture_centerCol { position: relative; display: flex; flex-direction: column; flex: 1; background: var(--dsw-alias-bg-base); }
    .fixture_phase { flex: 1; }
    #caption { position: fixed; inset: 0 0 auto; height: ${top}px; background: rgb(90,40,80); }
    #portal { position: fixed; right: 30px; top: 85px; width: 150px; height: 50px; border: 0;
      background: rgb(140,60,180); color: white; }
  </style><style id="liang-styles">${css}</style></head>
  <body ${desktop ? `data-dsh-desktop-mode="${mode}"` : ""}>
    <div id="root"><div class="fixture_frame"><aside class="fixture_sidebarCol"></aside><main class="fixture_centerCol"><div class="liang-skin-backdrop" data-media="sequence" data-mask="off" aria-hidden="true"><img class="liang-skin-sequence-frame" alt="" src="${portrait}"></div><div class="fixture_phase" data-phase="active"></div></main></div></div>
    <div id="caption"></div><button id="portal" type="button">Native portal</button>
  </body></html>`;
}

async function prepare(context, options = {}) {
  const page = await context.newPage();
  if (options.viewport) await page.setViewportSize(options.viewport);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setContent(fixture(options));
  await page.addScriptTag({ content: compiled.outputFiles[0].text });
  await page.evaluate(({ enabled }) => {
    const setEnabled = (value) => {
      enabled = value;
      if (enabled) document.body.dataset.liangSkin = "on";
      else delete document.body.dataset.liangSkin;
    };
    window.fixture = {
      portalClicks: 0,
      snapshot: () => ({ enabled }),
      setEnabled,
    };
    document.querySelector("#portal").addEventListener("click", () => window.fixture.portalClicks++);
    setEnabled(enabled);
  }, { enabled: options.enabled ?? true });
  await page.locator(".liang-skin-sequence-frame").evaluate(image => image.decode());
  return { page, errors };
}

// For the first pixel of a 1x1 PNG, every PNG filter's predictors are zero.
// Real rendered pixels catch opaque host layers that computed z-index misses.
async function pixelAt(page, x, y) {
  const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 }, animations: "disabled" });
  assert.equal(png.readUInt32BE(16), 1); assert.equal(png.readUInt32BE(20), 1);
  assert.equal(png[24], 8, "Expected an 8-bit screenshot");
  assert.ok(png[25] === 2 || png[25] === 6, "Expected an RGB/RGBA screenshot");
  const chunks = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    if (png.toString("ascii", offset + 4, offset + 8) === "IDAT") chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  return [...inflateSync(Buffer.concat(chunks)).subarray(1, 4)];
}
function closeColor(actual, expected, label) {
  assert.ok(actual.every((channel, i) => Math.abs(channel - expected[i]) <= 1), `${label}: expected ${expected}, received ${actual}`);
}

async function assertLayout(page, options, enabled = true) {
  const size = page.viewportSize();
  const result = await page.evaluate(() => {
    const root = document.querySelector("#root"), backdrop = document.querySelector(".liang-skin-backdrop");
    const box = element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; };
    return { root: box(root), center: box(document.querySelector(".fixture_centerCol")), rootPosition: getComputedStyle(root).position, rootZ: getComputedStyle(root).zIndex,
      backdrop: box(backdrop), portrait: box(backdrop.querySelector("img")), backdropZ: getComputedStyle(backdrop).zIndex, isolation: getComputedStyle(document.body).isolation,
      bgBase: getComputedStyle(document.body).getPropertyValue("--dsw-alias-bg-base").trim(),
      frameColor: getComputedStyle(document.querySelector(".fixture_frame")).backgroundColor,
      centerColor: getComputedStyle(document.querySelector(".fixture_centerCol")).backgroundColor,
      phasePosition: getComputedStyle(document.querySelector(".fixture_phase")).position };
  });
  assert.equal(result.rootPosition, options.desktop ? "fixed" : "static", "The host owns root positioning");
  assert.equal(result.rootZ, "auto", "The skin must not raise the root above native portals");
  const bounds = { x: 0, y: options.top ?? 0, width: size.width, height: size.height - (options.top ?? 0) };
  const centerBounds = { x: 200, y: options.top ?? 0, width: size.width - 200, height: size.height - (options.top ?? 0) };
  assert.deepEqual(result.root, bounds);
  if (enabled) {
    assert.deepEqual(result.center, centerBounds);
    assert.equal(result.isolation, "isolate"); assert.equal(result.backdropZ, "0");
    assert.equal(result.bgBase, "transparent", "Base surfaces must not apply a second portrait mask");
    assert.equal(result.centerColor, "rgba(0, 0, 0, 0)", "Conversation column must expose the stage");
    assert.equal(result.phasePosition, "relative", "Conversation content must paint above the stage");
    assert.deepEqual(result.backdrop, centerBounds);
    assert.equal(result.portrait.height, centerBounds.height, "Portrait follows the conversation column height");
    closeColor(await pixelAt(page, size.width - 30, 430), [32, 208, 96], "Portrait visible without a full-screen overlay");
    if (options.windows) assert.equal(result.frameColor, "rgb(11, 29, 49)", "Windows outer frame keeps its native fill");
  } else {
    assert.deepEqual(result.center, centerBounds);
    assert.equal(result.isolation, "auto", "Skin-off restores native stacking");
    assert.equal(result.bgBase, "rgb(240,244,248)");
    assert.equal(result.centerColor, "rgb(240, 244, 248)");
    assert.equal(result.phasePosition, "static");
    closeColor(await pixelAt(page, size.width - 30, 430), [240, 244, 248], "Skin-off native background");
    if (options.windows) assert.equal(result.frameColor, "rgb(11, 29, 49)");
  }
  closeColor(await pixelAt(page, 100, 430), [11, 29, 49], "Sidebar keeps its fill");
  if ((options.top ?? 0) > 0) closeColor(await pixelAt(page, 500, 5), [90, 40, 80], "Native titlebar remains painted");
  await page.locator("#portal").click();
  assert.equal(await page.evaluate(() => window.fixture.portalClicks), enabled ? 1 : 2, "Native body portal remains clickable");
}

async function maskChecks(page) {
  const result = await page.evaluate(() => {
    const backdrop = document.querySelector(".liang-skin-backdrop");
    backdrop.dataset.mask = "on";
    const enabled = {
      display: getComputedStyle(backdrop, "::after").display,
      background: getComputedStyle(backdrop, "::after").backgroundImage,
    };
    backdrop.dataset.mask = "off";
    const disabled = getComputedStyle(backdrop, "::after").display;
    const center = backdrop.parentElement;
    const wrapper = document.createElement("div");
    wrapper.style.display = "contents";
    const detail = document.createElement("section");
    detail.className = "fixture_page";
    detail.textContent = "Plugin detail";
    detail.style.cssText = "flex: 0 0 120px; padding: 20px; color: rgb(20, 25, 30); background: rgb(222, 10, 90);";
    wrapper.append(detail);
    center.insertBefore(wrapper, center.querySelector(".fixture_phase"));
    const rect = detail.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + 20, rect.y + 20);
    return {
      enabled,
      disabled,
      pluginDetailPosition: getComputedStyle(detail).position,
      pluginDetailTop: hit?.className ?? null,
      sample: { x: Math.floor(rect.x + 10), y: Math.floor(rect.y + 10) },
    };
  });
  assert.equal(result.enabled.display, "block", "Mask switch enables the stage scrim");
  assert.match(result.enabled.background, /rgba\(/, "Mask uses legacy-compatible rgba tokens");
  assert.equal(result.disabled, "none", "Mask switch removes the stage scrim");
  assert.equal(result.pluginDetailPosition, "relative", "Plugin detail content is positioned above the stage");
  assert.equal(result.pluginDetailTop, "fixture_page", "Plugin detail text is not covered by the backdrop");
  assert.deepEqual((await pixelAt(page, result.sample.x, result.sample.y)).slice(0, 3), [222, 10, 90],
    "The actual page pixels paint above the stage through a display:contents slot wrapper");
  console.log("PASS mask/detail: stage-local scrim toggle, rgba tokens, plugin detail text above stage");
}

// Account settings are a body portal, not a generic modal. Match the audited
// Host structure while using different build hashes and multiple class names.
async function overlayChecks(context) {
  let scenarios = 0;
  for (const hash of ["oldAccount42", "_44HXVa"]) {
    const { page, errors } = await prepare(context, { enabled: false });
    await page.evaluate(hash => {
      const style = document.createElement("style");
      style.textContent = `
        body { --dsw-alias-label-primary: rgb(34 38 42); --dsw-alias-label-secondary: rgb(75 81 87);
          --dsw-alias-border-l1: rgb(180 184 188); --dsw-radius-sm: 4px; }
        [data-account-host-fixture] { position: fixed; inset: 0; z-index: 1001;
          display: flex; flex-direction: column; background: var(--dsw-alias-bg-base); }
        html[data-windows-titlebar] [data-account-host-fixture] { padding-top: var(--dsh-windows-titlebar-height); }
        [data-account-host-fixture] > header { -webkit-app-region: initial; box-sizing: border-box;
          border-bottom: .5px solid var(--dsw-alias-border-l1); flex: none; height: 48px; padding: 6px 16px; }
        [data-account-host-fixture] .controls { display: flex; align-items: center; gap: 24px; padding-top: 5px; }
        [data-account-host-fixture] button { box-sizing: border-box; border-radius: var(--dsw-radius-sm);
          height: 28px; color: var(--dsw-alias-label-secondary); font: inherit; white-space: nowrap;
          cursor: pointer; background: transparent; border: none; justify-content: center; align-items: center;
          gap: 8px; padding: 0 6px; font-size: 14px; line-height: 22px; display: inline-flex; }
        [data-account-host-fixture] > [class*="_viewport"] { min-height: 0;
          color: var(--dsw-alias-label-secondary); flex: 1; position: relative; }
        [data-native-overlay-sentinel] { position: fixed; left: -2000px; width: 100px;
          height: 60px; --dsw-alias-bg-base: rgb(201 183 165);
          background: rgb(201 183 165); color: rgb(35 47 59); }
        [data-native-overlay-sentinel] > header { background: rgb(190 170 150); }
        #nested-account { inset: auto auto 0 -2000px; width: 100px; height: 60px;
          --dsw-alias-bg-base: rgb(210 190 170); --dsw-alias-label-secondary: rgb(35 47 59); }
      `;
      document.querySelector("#liang-styles").before(style);
      const accountMarkup = (id, nested = false) => `
        <div id="${id}" data-account-host-fixture role="dialog" aria-modal="true"
          class="native-screen ${hash}_overlay extra-overlay">
          <header data-window-drag class="${hash}_header extra-header">
            <div class="controls ${hash}_controls">
              <button id="${nested ? "nested-back" : "account-back"}" type="button"
                class="native-control ${hash}_back extra-back" aria-label="返回">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="2"/>
                </svg><span>返回</span>
              </button>
            </div>
          </header>
          <div class="native-scroll ${hash}_viewport extra-viewport"></div>
        </div>`;
      document.querySelector("#root").insertAdjacentHTML("beforeend", accountMarkup("nested-account", true));
      document.body.insertAdjacentHTML("beforeend", `
        <div id="ordinary-modal" role="dialog" aria-modal="true" data-native-overlay-sentinel
          class="native-modal ${hash}_dialog extra-dialog">
          <header data-window-drag><button class="${hash}_back">Back</button></header>
          <div class="${hash}_viewport"></div>
        </div>
        <div id="ordinary-menu" role="menu" data-native-overlay-sentinel
          class="native-menu ${hash}_overlay extra-menu"><button role="menuitem">Item</button></div>
        ${accountMarkup("account-overlay")}`);
      window.accountBackClicks = 0;
      document.querySelector("#account-back").addEventListener("click", () => window.accountBackClicks++);
      window.overlayFixture = {
        applyPalette(frame) {
          const palette = window.LiangPalette.paletteForFrame(frame);
          const mapping = { page: "page", base: "bg-base", layer1: "layer-1", layer2: "layer-2",
            layer3: "layer-3", sidebar: "sidebar", ink: "ink", secondary: "secondary",
            tertiary: "tertiary", border: "border", accent: "accent", accentHover: "accent-hover",
            hover: "hover", portraitOpacity: "portrait-opacity" };
          for (const [key, variable] of Object.entries(mapping)) {
            document.body.style.setProperty(`--liang-${variable}`, palette[key]);
          }
          document.body.dataset.liangStage = String(palette.stage);
          return palette;
        },
        snapshot() {
          const read = element => {
            const computed = getComputedStyle(element);
            return { background: computed.backgroundColor, color: computed.color,
              base: computed.getPropertyValue("--dsw-alias-bg-base").trim() };
          };
          const overlay = document.querySelector("#account-overlay");
          return { overlay: read(overlay), header: read(overlay.querySelector("header")),
            back: read(overlay.querySelector("button")), viewport: read(overlay.querySelector('[class*="_viewport"]')),
            sentinels: [...document.querySelectorAll('#ordinary-modal, #ordinary-modal > header, #ordinary-menu, #nested-account, #nested-account > header, #nested-back, #nested-account > [class*="_viewport"]')].map(read) };
        },
      };
    }, hash);
    const maxFrame = await page.evaluate(() => window.LiangPalette.PREVIEW_MAX_FRAME);
    for (const { name, frame, stage } of [
      { name: "light", frame: 0, stage: 0 },
      { name: "black-gold", frame: maxFrame, stage: 5 },
    ]) {
      await page.evaluate(() => window.fixture.setEnabled(false));
      const palette = await page.evaluate(frame => window.overlayFixture.applyPalette(frame), frame);
      assert.equal(palette.stage, stage, "Use the actual internal maximum frame for black-gold");
      const native = await page.evaluate(() => window.overlayFixture.snapshot());
      await page.evaluate(() => window.fixture.setEnabled(true));
      const active = await page.evaluate(() => window.overlayFixture.snapshot());
      const expectedPage = `rgb(${palette.page.match(/\d+/g).join(", ")})`;
      const expectedSecondary = `rgb(${palette.secondary.match(/\d+/g).join(", ")})`;
      assert.equal(active.overlay.background, expectedPage, `${hash}/${name}: account overlay restores an opaque page surface`);
      assert.equal(active.overlay.base, palette.page, `${hash}/${name}: background token is local to the account overlay`);
      assert.equal(active.viewport.background, "rgba(0, 0, 0, 0)", "Keep the native transparent viewport");
      assert.equal(active.viewport.base, palette.page, `${hash}/${name}: viewport inherits the locally restored base token`);
      assert.equal(active.viewport.color, expectedSecondary, "Keep the native viewport secondary text color");
      assert.equal(active.header.background, "rgba(0, 0, 0, 0)", "Keep the native transparent header");
      assert.equal(active.back.background, "rgba(0, 0, 0, 0)", "Keep the native transparent back button");
      assert.equal(active.back.color, expectedSecondary, `${hash}/${name}: back icon and label use the native secondary text token`);
      assert.equal(await page.locator("#account-overlay > header").evaluate(element => getComputedStyle(element).height), "48px");
      assert.equal(await page.locator("#account-back").evaluate(element => getComputedStyle(element).height), "28px");
      const pageRgb = palette.page.match(/\d+/g).map(Number);
      closeColor(await pixelAt(page, 500, 20), pageRgb, `${hash}/${name}: header paints over the opaque account surface`);
      closeColor(await pixelAt(page, 1070, 430), pageRgb, `${hash}/${name}: portrait does not bleed through the account viewport`);
      assert.deepEqual(active.sentinels, native.sentinels, "Account styles must not affect ordinary modals, menus, or non-body portals");
      const clicks = await page.evaluate(() => window.accountBackClicks);
      await page.locator("#account-back").click();
      assert.equal(await page.evaluate(() => window.accountBackClicks), clicks + 1, "Native back button remains clickable");
      await page.evaluate(() => window.fixture.setEnabled(false));
      assert.deepEqual(await page.evaluate(() => window.overlayFixture.snapshot()), native, "Disabling the skin restores every native overlay style");
      scenarios++;
      console.log(`PASS account overlay ${hash}/${name}: opaque portal, native header/back, ordinary modal/menu boundaries, skin-off restore`);
    }
    assert.deepEqual(errors, [], `${hash}: overlay browser errors`);
    await page.close();
  }
  return scenarios;
}

const browser = await chromium.launch({ executablePath: await chromeExecutable(), headless: true });
try {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce", deviceScaleFactor: 1 });
  await context.route("**/*", route => route.abort()); // No network needed by the fixture.
  const cases = [
    { name: "Web static root" }, { name: "Desktop fixed top 0", desktop: true, top: 0 },
    { name: "Windows fixed top 36", desktop: true, windows: true, top: 36 },
    { name: "Windows extended top 40", desktop: true, windows: true, top: 40, mode: "extended" },
    { name: "macOS extended top 36", desktop: true, top: 36, mode: "extended" },
    { name: "macOS fixed top 40", desktop: true, top: 40 },
    { name: "Compact Desktop", desktop: true, windows: true, top: 36, viewport: { width: 800, height: 600 } },
    { name: "Large Web", viewport: { width: 1800, height: 1300 } },
  ];
  for (const options of cases) {
    const { page, errors } = await prepare(context, options);
    await assertLayout(page, options); await page.evaluate(() => window.fixture.setEnabled(false));
    await assertLayout(page, options, false); assert.deepEqual(errors, [], `${options.name}: browser errors`);
    await page.close(); console.log(`PASS ${options.name}: backdrop, host geometry, native portal, skin off`);
  }
  const maskFixture = await prepare(context);
  await maskChecks(maskFixture.page);
  assert.deepEqual(maskFixture.errors, [], "Mask fixture: browser errors");
  await maskFixture.page.close();
  const first = await prepare(context), second = await prepare(context, { desktop: true, windows: true, top: 40 });
  await first.page.evaluate(() => window.fixture.setEnabled(false));
  assert.equal(await second.page.evaluate(() => window.fixture.snapshot().enabled), true);
  closeColor(await pixelAt(first.page, 1070, 430), [240, 244, 248], "First window skin off");
  closeColor(await pixelAt(second.page, 1070, 430), [32, 208, 96], "Second window remains visible");
  assert.deepEqual([...first.errors, ...second.errors], []);
  const overlayScenarios = await overlayChecks(context);
  await context.close();
  console.log("PASS independent windows: host geometry and skin state stay isolated");
  console.log(`Client compatibility browser checks passed (${cases.length + 2 + overlayScenarios} scenarios). Native Desktop validation remains manual.`);
} finally { await browser.close(); }
