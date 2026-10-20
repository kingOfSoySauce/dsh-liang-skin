import assert from "node:assert/strict";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { build } from "esbuild";
import { chromium } from "playwright-core";

// Self-contained host contracts; native Desktop acceptance remains manual.
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const packageId = "@leon___/dsh-client-liang-intensity-skin";
const viewport = { width: 1100, height: 700 };
const css = await readFile(new URL("../src/client/skin.css", import.meta.url), "utf8");
const compiled = await build({ absWorkingDir: projectRoot,
  stdin: { resolveDir: projectRoot, contents: `
    export { installLiangAppearanceButton } from './src/client/appearance.ts';
    export { paletteForFrame, PREVIEW_MAX_FRAME } from './src/client/logic.ts';
  ` },
  bundle: true, write: false, format: "iife", globalName: "LiangAppearance", platform: "browser", target: "es2022" });

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
      --liang-page: rgb(240,244,248); --liang-bg-base: rgb(0 0 0 / 25%); --liang-portrait-opacity: 1;
      --liang-sidebar: rgb(11,29,49); --liang-ink: rgb(20,25,30); --liang-secondary: rgb(55,60,65);
      --liang-border: rgb(100,110,120); --liang-layer-1: white; --dsh-desktop-frame-height: ${top}px;
      background: rgb(240,244,248); }
    #root { position: ${desktop ? "fixed" : "static"}; ${desktop ? `inset: ${top}px 0 0;` : ""}
      height: ${desktop ? `calc(100vh - ${top}px)` : "100vh"}; z-index: auto; background: var(--dsw-alias-bg-base); }
    .fixture_frame { display: flex; height: 100%; ${windows ? "background: var(--dsw-specific-sidebar-fill);" : ""} }
    .fixture_sidebarCol { flex: 0 0 200px; background: var(--dsw-specific-sidebar-fill); }
    .fixture_centerCol { flex: 1; background: var(--dsw-alias-bg-base); }
    #caption { position: fixed; inset: 0 0 auto; height: ${top}px; background: rgb(90,40,80); }
    #portal { position: fixed; right: 30px; top: 85px; width: 150px; height: 50px; border: 0;
      background: rgb(140,60,180); color: white; }
    #appearance-host { position: absolute; top: ${top + 155}px; left: 225px; width: 620px; }
    .fixture_group { margin-bottom: 8px; } .fixture_group > div { display: flex; gap: 4px; }
    .native-choice { padding: 16px; flex: 1; }
  </style><style id="liang-styles">${css}</style></head>
  <body ${desktop ? `data-dsh-desktop-mode="${mode}"` : ""}>
    <div class="liang-skin-backdrop" data-media="sequence" aria-hidden="true"><img class="liang-skin-sequence-frame" alt="" src="${portrait}"></div>
    <div id="root"><div class="fixture_frame"><aside class="fixture_sidebarCol"></aside><main class="fixture_centerCol"></main></div></div>
    <div id="caption"></div><div id="appearance-host"></div><button id="portal" type="button">Native portal</button>
  </body></html>`;
}

async function prepare(context, options = {}) {
  const page = await context.newPage();
  if (options.viewport) await page.setViewportSize(options.viewport);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setContent(fixture(options));
  await page.addScriptTag({ content: compiled.outputFiles[0].text });
  await page.evaluate(({ packageId, enabled }) => {
    let snapshot = { enabled };
    const listeners = new Set();
    const calls = [];
    let releaseChoice, holdNextChoice = false, failNextChoice = false;
    let dispose = () => {};
    const publish = patch => {
      snapshot = { ...snapshot, ...patch };
      if (snapshot.enabled) document.body.dataset.liangSkin = "on";
      else delete document.body.dataset.liangSkin;
      for (const listener of listeners) listener();
    };
    const scope = {
      getSnapshot: () => snapshot,
      subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    };
    const presenter = {
      async choose(value) {
        calls.push(["choose", value]);
        if (holdNextChoice) { holdNextChoice = false; await new Promise(resolve => { releaseChoice = resolve; }); }
        if (failNextChoice) { failNextChoice = false; throw new Error("fixture choice rejected"); }
        publish({ enabled: value });
      },
    };
    const markup = hash => `<section class="fixture_group ${hash}_group extra-group"><div class="layout-row ${hash}_cubeRow extra-row" id="native-row">${["light", "dark", "system"].map(theme => `<button type="button" class="native-choice extra-button ${hash}_themeCube" data-theme="${theme}">${theme}</button>`).join("")}</div></section>`;
    const connectNative = () => {
      for (const button of document.querySelectorAll("#native-row > button[data-theme]")) {
        button.addEventListener("click", () => { window.fixture.nativeClicks++; window.fixture.nativeTheme = button.dataset.theme; });
      }
    };
    window.fixture = {
      calls, nativeClicks: 0, nativeTheme: null, portalClicks: 0,
      snapshot: () => ({ ...snapshot }), listenerCount: () => listeners.size,
      install(hash = "_8HJdBW") {
        document.querySelector("#appearance-host").innerHTML =
          '<section class="fixture_group other_group"><div class="other_cubeRow" id="unrelated"><button>one</button><button>two</button><button>three</button></div></section>' +
          '<section class="fixture_group nested_group"><div class="nested_cubeRow" id="nested-unrelated"><span><button class="nested_themeCube">one</button><button class="nested_themeCube">two</button><button class="nested_themeCube">three</button></span></div></section>' + markup(hash);
        connectNative();
        dispose = window.LiangAppearance.installLiangAppearanceButton(scope, presenter, packageId);
      },
      rebuild(hash = "_newHash42") {
        document.querySelector("#native-row").parentElement.outerHTML = markup(hash); connectNative();
      },
      removeRow() { document.querySelector("#native-row").parentElement.remove(); },
      restoreRow(hash = "_restored") {
        document.querySelector("#appearance-host").insertAdjacentHTML("beforeend", markup(hash)); connectNative();
      },
      dispose() { dispose(); }, setEnabled(value) { publish({ enabled: value }); },
      holdChoice() { holdNextChoice = true; }, releaseChoice() { releaseChoice?.(); },
      rejectChoice() { failNextChoice = true; },
    };
    document.querySelector("#portal").addEventListener("click", () => window.fixture.portalClicks++);
    publish({});
  }, { packageId, enabled: options.enabled ?? true });
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
    return { root: box(root), rootPosition: getComputedStyle(root).position, rootZ: getComputedStyle(root).zIndex,
      backdrop: box(backdrop), portrait: box(backdrop.querySelector("img")), backdropZ: getComputedStyle(backdrop).zIndex, isolation: getComputedStyle(document.body).isolation,
      bgBase: getComputedStyle(document.body).getPropertyValue("--dsw-alias-bg-base").trim(),
      frameColor: getComputedStyle(document.querySelector(".fixture_frame")).backgroundColor };
  });
  assert.equal(result.rootPosition, options.desktop ? "fixed" : "static", "The host owns root positioning");
  assert.equal(result.rootZ, "auto", "The skin must not raise the root above native portals");
  const bounds = { x: 0, y: options.top ?? 0, width: size.width, height: size.height - (options.top ?? 0) };
  assert.deepEqual(result.root, bounds);
  if (enabled) {
    assert.equal(result.isolation, "isolate"); assert.equal(result.backdropZ, "-1");
    assert.equal(result.bgBase, "transparent", "Base surfaces must not apply a second portrait mask");
    assert.deepEqual(result.backdrop, bounds);
    assert.equal(result.portrait.height, bounds.height, "Portrait follows the background container height");
    closeColor(await pixelAt(page, size.width - 30, 430), [24, 156, 72], "Portrait visible with exactly one 25% mask");
    if (options.windows) assert.equal(result.frameColor, "rgba(0, 0, 0, 0)", "Only the Windows outer frame becomes transparent");
  } else {
    assert.equal(result.isolation, "auto", "Skin-off restores native stacking");
    assert.equal(result.bgBase, "rgb(240,244,248)");
    closeColor(await pixelAt(page, size.width - 30, 430), [240, 244, 248], "Skin-off native background");
    if (options.windows) assert.equal(result.frameColor, "rgb(11, 29, 49)");
  }
  closeColor(await pixelAt(page, 100, 430), [11, 29, 49], "Sidebar keeps its fill");
  if ((options.top ?? 0) > 0) closeColor(await pixelAt(page, 500, 5), [90, 40, 80], "Native titlebar remains painted");
  await page.locator("#portal").click();
  assert.equal(await page.evaluate(() => window.fixture.portalClicks), enabled ? 1 : 2, "Native body portal remains clickable");
}

async function appearanceChecks(page, hash) {
  await page.evaluate(hash => window.fixture.install(hash), hash);
  const custom = page.locator("#native-row > .liang-appearance-choice");
  await custom.waitFor();
  assert.equal(await page.locator(".liang-appearance-choice").count(), 1);
  assert.equal(await page.locator("#unrelated .liang-appearance-choice, #nested-unrelated .liang-appearance-choice").count(), 0);
  assert.equal(await custom.getAttribute("data-plugin"), packageId);
  assert.equal(await custom.getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator(".liang-appearance-binding, input[role=switch]").count(), 0,
    "The imperative appearance extension must not draw its own binding switch");
  for (const theme of ["light", "dark", "system"]) {
    await page.locator(`[data-theme="${theme}"]`).click();
    await page.waitForFunction(() => !window.fixture.snapshot().enabled);
    assert.equal(await page.locator(".liang-appearance-binding").count(), 0);
    assert.equal(await custom.getAttribute("aria-pressed"), "false");
    assert.equal(await page.evaluate(() => window.fixture.nativeTheme), theme);
    await custom.click(); await page.waitForFunction(() => window.fixture.snapshot().enabled);
  }
  assert.equal(await page.evaluate(() => window.fixture.nativeClicks), 3, "Native theme handlers still run");
  await page.evaluate(() => {
    window.oldNative = document.querySelector('[data-theme="light"]');
    window.oldCustom = document.querySelector(".liang-appearance-choice");
    window.fixture.rebuild();
  });
  await page.locator("#native-row._newHash42_cubeRow > .liang-appearance-choice").waitFor();
  assert.equal(await page.locator(".liang-appearance-choice").count(), 1, "DOM reconstruction produces one control");
  const beforeStaleClicks = await page.evaluate(() => window.fixture.calls.length);
  await page.evaluate(() => { window.oldNative.click(); window.oldCustom.click(); });
  assert.equal(await page.evaluate(() => window.fixture.calls.length), beforeStaleClicks, "Replaced nodes lose plugin listeners");
  await page.locator('[data-theme="dark"]').click(); await page.waitForFunction(() => !window.fixture.snapshot().enabled);
  await custom.click(); await page.waitForFunction(() => window.fixture.snapshot().enabled);
  await page.evaluate(() => window.fixture.removeRow());
  await page.waitForFunction(() => document.querySelector(".liang-appearance-choice") === null);
  await page.evaluate(() => window.fixture.restoreRow()); await custom.waitFor();
  await page.evaluate(() => window.fixture.rejectChoice()); await page.locator('[data-theme="light"]').click();
  await page.waitForFunction(() => !document.querySelector(".liang-appearance-choice").disabled);
  assert.equal(await custom.getAttribute("aria-pressed"), "true", "Rejected preference preserves skin state");
  await page.evaluate(() => window.fixture.holdChoice()); await page.locator('[data-theme="light"]').click();
  assert.equal(await custom.isDisabled(), true, "Outstanding choices disable injected controls");
  await page.evaluate(() => {
    window.oldCustom = document.querySelector(".liang-appearance-choice");
    window.fixture.dispose(); window.fixture.dispose(); window.fixture.releaseChoice();
  });
  await page.waitForFunction(() => !window.fixture.snapshot().enabled);
  assert.equal(await page.locator(".liang-appearance-choice, .liang-appearance-binding").count(), 0, "Late choice cannot resurrect disposed controls");
  assert.equal(await page.evaluate(() => window.fixture.listenerCount()), 0);
  const beforeDisposedClicks = await page.evaluate(() => window.fixture.calls.length);
  await page.evaluate(() => {
    window.oldCustom.click(); document.querySelector('[data-theme="dark"]').click();
    document.querySelector("#appearance-host").append(document.createElement("span"));
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  assert.equal(await page.evaluate(() => window.fixture.calls.length), beforeDisposedClicks);
  assert.equal(await page.locator(".liang-appearance-choice, .liang-appearance-binding").count(), 0);
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
          const palette = window.LiangAppearance.paletteForFrame(frame);
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
    const maxFrame = await page.evaluate(() => window.LiangAppearance.PREVIEW_MAX_FRAME);
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
  for (const hash of ["_8HJdBW", "_currentHash89"]) {
    const { page, errors } = await prepare(context); await appearanceChecks(page, hash);
    assert.deepEqual(errors, [], `${hash}: browser errors`); await page.close();
    console.log(`PASS appearance ${hash}: multi-class discovery, choices, DOM rebuild, disposal race`);
  }
  const first = await prepare(context), second = await prepare(context, { desktop: true, windows: true, top: 40 });
  await first.page.evaluate(() => window.fixture.install()); await second.page.evaluate(() => window.fixture.install("_otherWindow"));
  await first.page.locator('[data-theme="light"]').click(); await first.page.waitForFunction(() => !window.fixture.snapshot().enabled);
  assert.equal(await second.page.evaluate(() => window.fixture.snapshot().enabled), true);
  closeColor(await pixelAt(first.page, 1070, 430), [240, 244, 248], "First window skin off");
  closeColor(await pixelAt(second.page, 1070, 430), [24, 156, 72], "Second window remains visible");
  assert.deepEqual([...first.errors, ...second.errors], []);
  const overlayScenarios = await overlayChecks(context);
  await context.close();
  console.log("PASS independent windows: host geometry and appearance state stay isolated");
  console.log(`Client compatibility browser checks passed (${cases.length + 3 + overlayScenarios} scenarios). Native Desktop validation remains manual.`);
} finally { await browser.close(); }
