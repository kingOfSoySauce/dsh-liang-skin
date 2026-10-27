import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const assetGroups = new Map(['portrait-source-v2', 'portrait-source-xianxia-v2'].map((directory) => {
  const assetPaths = manifest.files.filter((file) => file.startsWith(`assets/${directory}/`) && file.endsWith('.webp'));
  assert.equal(assetPaths.length, 24, `The published client must contain all 24 anchors in ${directory}`);
  return [directory, new Map(assetPaths.map((file) => [file.split('/').at(-1), readFileSync(new URL(file, root))]))];
}));
const client = readFileSync(new URL('lib/client.js', root), 'utf8');
const imageSelector = '.liang-skin-backdrop[data-media="sequence"] > img';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : process.platform === 'darwin'
      ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }
      : {}),
});

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

async function bounded(promise, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), 15000); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function fixture({ fail = () => false, holdRetry = null, enabled = true, nativeTheme = 'system' } = {}) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  const retriesReleased = deferred();
  let closing = false;
  let hold = null;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('http://liang.test/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/") {
      await route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body><main id="root"><div class="fixture_centerCol" style="position:relative;min-height:100vh"><section class="current_group"><div class="current_cubeRow"><button type="button" class="current_themeCube">浅色</button><button type="button" class="current_themeCube">深色</button><button type="button" class="current_themeCube">跟随系统</button></div></section></div></main></body></html>' });
      return;
    }
    const match = url.pathname.match(/^\/plugins\/.+\/assets\/(portrait-source(?:-xianxia)?-v2)\/([^/]+\.webp)$/);
    const assets = match && assetGroups.get(match[1]);
    assert.ok(assets?.has(match[2]), `Unexpected runtime request: ${url.pathname}`);
    const directory = match[1], name = match[2];
    const retry = Number(url.searchParams.get('retry') ?? 0);
    requests.push({ directory, name, retry, url: url.href });
    const currentHold = hold;
    if (currentHold !== null) {
      currentHold.count += 1;
      if (currentHold.count === assets.size) currentHold.started.resolve();
      await currentHold.release.promise;
    }
    if (name === holdRetry && retry > 0) await retriesReleased.promise;
    const unavailable = fail(name, retry, directory);
    try {
      await route.fulfill({
        status: unavailable ? 503 : 200,
        contentType: 'image/webp',
        headers: { 'cache-control': 'no-store' },
        body: unavailable ? Buffer.from('fixture: unavailable portrait') : assets.get(name),
      });
    } catch (error) {
      // Removing an Image's src during disposal may cancel its held request.
      if (!closing) throw error;
    } finally {
      if (currentHold !== null) {
        currentHold.finishedCount += 1;
        if (currentHold.finishedCount === assets.size) currentHold.finished.resolve();
      }
    }
  });
  await page.goto('http://liang.test/');
  await page.evaluate(({ enabled, nativeTheme }) => {
    if (!enabled) localStorage.setItem('dsh-liang-intensity-skin.enabled.v1', '0');
    const runtime = {
      cleanups: [], decoded: new WeakSet(), decodedImages: [],
      registered: null, scope: null, presenter: null, module: null,
      activeLocales: 0, activeSlots: 0, errors: [],
      registrations: new Map(), dictionaries: new Map(), settings: null,
      expectedTheme: nativeTheme, themePreference: nativeTheme, themeSetCalls: [], themeGets: 0,
    };
    window.__runtime = runtime;
    document.body.toggleAttribute('data-ds-dark-theme', nativeTheme === 'dark');
    window.addEventListener('unhandledrejection', (event) => runtime.errors.push(String(event.reason)));
    // Observe successful native decodes without substituting Image, pixels,
    // timing, or the browser's decode result.
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function (...args) {
      return decode.apply(this, args).then((value) => {
        runtime.decoded.add(this);
        runtime.decodedImages.push(this);
        return value;
      });
    };
    const unexpectedRender = () => { throw new Error('The runtime fixture must not render a host React component'); };
    // The runtime regression never emulates React hooks or native controls.
    // The real DSH page owns the native Switches and immediate-change UI checks.
    window.__ModuleLoader__ = {
      load({ id, factory }) {
        runtime.moduleId = id;
        runtime.module = factory((name) => {
          if (name === 'react') return {
            useEffect: unexpectedRender, useMemo: unexpectedRender, useCallback: unexpectedRender,
            useRef: unexpectedRender, useState: unexpectedRender,
            useSyncExternalStore: unexpectedRender,
          };
          if (name === 'react/jsx-runtime') return { jsx: unexpectedRender, jsxs: unexpectedRender };
          if (name === '@deepseek-ai/dsh-client-ui-primitives') return { Switch: unexpectedRender, Button: unexpectedRender };
          throw new Error(`Unexpected client import: ${name}`);
        });
      },
    };
  }, { enabled, nativeTheme });
  await page.addScriptTag({ content: client });
  await page.evaluate(() => {
    const runtime = window.__runtime;
    const theme = {
      getTheme: () => ({ preference: runtime.themePreference }),
      setTheme: (next) => {
        runtime.themeSetCalls.push(next);
        runtime.themePreference = next;
        document.body.toggleAttribute('data-ds-dark-theme', next === 'dark');
      },
    };
    const ctx = {
      effect(setup) {
        const cleanup = setup();
        if (typeof cleanup === 'function') runtime.cleanups.push(cleanup);
      },
      get(name) {
        if (name === 'theme') { runtime.themeGets++; return theme; }
        if (name === 'remote') return undefined;
        throw new Error(`Unexpected host service: ${name}`);
      },
      locale: {
        bind(namespace) { return (key) => runtime.dictionaries.get(namespace)?.zh?.[key] ?? key; },
        register(namespace, dictionaries) {
          runtime.activeLocales += 1;
          runtime.dictionaries.set(namespace, dictionaries);
          return () => {
            runtime.activeLocales -= 1;
            runtime.dictionaries.delete(namespace);
          };
        },
      },
      slots: {
        inject(name, callback) {
          const cleanup = callback();
          if (typeof cleanup === 'function') runtime.cleanups.push(cleanup);
        },
        register(definition, component) {
          runtime.activeSlots += 1;
          const props = definition.inject?.('fixture-session') ?? {};
          const registration = { definition, component, props };
          const key = definition.id ?? definition.key;
          runtime.registrations.set(key, registration);
          if (definition.name === 'conversation.input.right' && definition.id === 'liang-intensity-control') {
            runtime.registered = props;
            runtime.scope = props.scope;
            runtime.presenter = props.presenter;
          } else if (definition.name === 'settings.section') {
            runtime.settingsSection = registration;
          } else if (definition.name === 'plugins.bundle.config') {
            runtime.settings = registration;
          } else {
            throw new Error(`Unexpected client slot: ${definition.name}:${key}`);
          }
          return () => {
            runtime.activeSlots -= 1;
            runtime.registrations.delete(key);
          };
        },
      },
      sessions: { subagentAddress: () => undefined },
      modelDirectories: {
        directoryFor: () => ({
          store: { getSnapshot: () => ({ current: null, groups: [], status: 'ready', error: null }), subscribe: () => () => {} },
          load: async () => {},
          select: async () => ({ ok: true }),
        }),
      },
    };
    if (typeof runtime.module?.apply !== 'function') throw new Error('Built client did not export apply(ctx)');
    runtime.module.apply(ctx);
    runtime.reapply = () => runtime.module.apply(ctx);
    runtime.dispose = () => {
      for (const cleanup of runtime.cleanups.splice(0).reverse()) cleanup();
    };
  });
  assert.equal(await page.getAttribute('body', 'data-liang-skin'), enabled ? 'on' : null,
    'apply(ctx) respects the persisted master switch');
  await assertNativeAppearance(page);
  return {
    page, requests, errors,
    releaseRetries: () => retriesReleased.resolve(),
    holdImages() {
      hold = { count: 0, finishedCount: 0, started: deferred(), release: deferred(), finished: deferred() };
      return hold;
    },
    async dispose() {
      closing = true;
      await page.evaluate(() => window.__runtime.dispose());
    },
    async close() {
      closing = true;
      hold?.release.resolve();
      retriesReleased.resolve();
      await context.close();
    },
  };
}

async function waitForPortrait(page, filename, retry = null, directory = 'portrait-source-v2') {
  await page.waitForFunction(({ selector, filename, retry, directory }) => {
    const image = document.querySelector(selector);
    if (!(image instanceof HTMLImageElement) || !image.currentSrc || !image.complete || image.naturalWidth === 0) return false;
    const url = new URL(image.currentSrc);
    return url.pathname.endsWith(`/assets/${directory}/${filename}`)
      && (retry === null || url.searchParams.get('retry') === String(retry))
      && window.__runtime.decoded.has(image)
      && getComputedStyle(image).display !== 'none'
      && image.getBoundingClientRect().height > 0;
  }, { selector: imageSelector, filename, retry, directory }, { timeout: 15000 });
}

async function assertRemoved(page, fullyDisposed = false) {
  const result = await page.evaluate((fullyDisposed) => ({
    backdrop: document.querySelectorAll('.liang-skin-backdrop').length,
    skin: document.body.hasAttribute('data-liang-skin'),
    stage: document.body.hasAttribute('data-liang-stage'),
    variables: [...document.body.style].filter((name) => name.startsWith('--liang-')),
    retainedSources: window.__runtime.decodedImages.filter((image) => image.hasAttribute('src')).length,
    styles: [...document.head.querySelectorAll('style')].filter((style) => style.dataset.plugin).length,
    controls: document.querySelectorAll('.liang-appearance-choice, .liang-appearance-binding').length,
    locales: window.__runtime.activeLocales,
    slots: window.__runtime.activeSlots,
    canvases: document.querySelectorAll('canvas').length,
    settingsAvailable: [...window.__runtime.registrations.values()].some(({ definition }) => definition.name === 'plugins.bundle.config'),
  }), fullyDisposed);
  assert.equal(result.backdrop, 0, 'No portrait backdrop remains');
  assert.equal(result.skin, false, 'Skin marker is removed');
  assert.equal(result.stage, false, 'Stage marker is removed');
  assert.deepEqual(result.variables, [], 'All presenter CSS variables are removed');
  assert.equal(result.retainedSources, 0, 'Decoded images release their network sources');
  assert.equal(result.canvases, 0, 'No optional particle canvas remains');
  assert.equal(result.settingsAvailable, !fullyDisposed, 'Plugin settings remain registered while the master switch is off');
  if (fullyDisposed) {
    assert.equal(result.styles, 0, 'Client stylesheet is removed');
    assert.equal(result.controls, 0, 'Appearance controls are removed');
    assert.equal(result.locales, 0, 'Locale registration is released');
    assert.equal(result.slots, 0, 'Slot registration is released');
  }
}

async function assertPluginSettings(page) {
  const result = await page.evaluate(async () => {
    const runtime = window.__runtime;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const settings = runtime.settings;
    check(settings?.definition.name === 'plugins.bundle.config'
      && settings.definition.key === '@leon___/dsh-client-liang-intensity-skin',
    'Settings use the official bundle config slot and scoped npm package key');
    check(typeof settings.component === 'function', 'The plugin contributes its SettingsPanel component');
    check(settings.props.scope === runtime.scope, 'Settings and portrait share the real preference store');
    check(runtime.settingsSection?.definition.id === 'liang-skin-settings'
      && runtime.settingsSection.definition.label() === '滑动变祖', 'Settings sidebar has its own localized entry');
    check(runtime.settingsSection.props.scope === settings.props.scope, 'Both settings entrances use exactly the same store');
    await runtime.settingsSection.props.scope.setOption('hideSlider', true);
    check(settings.props.scope.getSnapshot().hideSlider === true, 'A change from Settings is shared with plugin details immediately');
    await settings.props.scope.setOption('hideSlider', false);

    check(![...runtime.registrations.values()].some(({ definition }) => definition.name === 'settings.general.item'),
      'The old General binding and mask rows are removed');
    const dictionary = runtime.dictionaries.get(settings.definition.locale);
    for (const key of ['enabled', 'bindEffort', 'maskEnabled', 'xianxiaPortraits', 'particlesEnabled', 'motionEnabled', 'fineStopsEnabled', 'hideSlider']) {
      check(typeof dictionary?.zh?.[`settings.${key}`] === 'string'
        && typeof dictionary?.en?.[`settings.${key}`] === 'string', `Setting ${key} has both locales`);
    }
    const before = runtime.scope.getSnapshot();
    check(before.bindEffort && before.maskEnabled, 'Binding and mask retain their existing defaults');
    await runtime.scope.update({ bindEffort: false, maskEnabled: false });
    check(!runtime.scope.getSnapshot().bindEffort && !runtime.scope.getSnapshot().maskEnabled,
      'A multi-setting save applies both values through the real store');
    check(document.querySelector('.liang-skin-backdrop')?.dataset.mask === 'off', 'Saved mask state reaches the presenter');
    const record = JSON.parse(localStorage.getItem('dsh-liang-intensity-skin.settings.v1'));
    check(record?.version === 1 && record.values.bindEffort === false && record.values.maskEnabled === false,
      'The saved binding and mask share one versioned record');
    const accepted = runtime.scope.getSnapshot();
    const setItem = Storage.prototype.setItem;
    let rejected = false;
    try {
      Storage.prototype.setItem = () => { throw new Error('fixture: storage write rejected'); };
      try { await runtime.scope.update({ bindEffort: true, maskEnabled: true }); } catch { rejected = true; }
    } finally {
      Storage.prototype.setItem = setItem;
    }
    check(rejected && runtime.scope.getSnapshot() === accepted,
      'A rejected save leaves all accepted settings unchanged');
    await runtime.scope.setBindEffort(true);
    await runtime.scope.setMaskEnabled(true);
    check(document.querySelector('.liang-skin-backdrop')?.dataset.mask === 'on', 'The mask remains usable after a failed save');
    return { passed: true, slots: runtime.activeSlots };
  });
  assert.equal(result.passed, true);
  assert.equal(result.slots, 3, 'Runtime registers the conversation control plus both settings entry points');
}

async function assertOptionalEffects(test) {
  const { page, requests } = test;
  await page.waitForFunction(() => window.__runtime.decodedImages.length === 24, null, { timeout: 15000 });
  await waitForPortrait(page, 'stage-30.webp');
  assert.equal(requests.length, 24, 'Default activation only requests the original portraits');
  assert.ok(requests.every(({ directory }) => directory === 'portrait-source-v2'), 'Xianxia images remain lazy by default');
  assert.equal(await page.locator('canvas').count(), 0, 'Default activation creates no particle canvas');
  assert.equal(await page.locator('.liang-skin-backdrop').getAttribute('data-motion'), null, 'Default activation adds no motion marker');

  const beforeXianxia = requests.length;
  await page.evaluate(() => window.__runtime.scope.setOption('xianxiaPortraits', true));
  await page.waitForFunction(() => window.__runtime.decodedImages.length >= 48, null, { timeout: 15000 });
  await waitForPortrait(page, 'stage-30.webp', null, 'portrait-source-xianxia-v2');
  const xianxiaRequests = requests.slice(beforeXianxia);
  assert.equal(xianxiaRequests.length, 24, 'Opting into Xianxia loads its 24 anchors once');
  assert.ok(xianxiaRequests.every(({ directory }) => directory === 'portrait-source-xianxia-v2'),
    'Changing portraits does not reload the previous set');
  assert.equal(await page.locator('canvas').count(), 0, 'Xianxia portraits do not enable particles');
  const afterPortraitChange = requests.length;

  await page.evaluate(() => window.__runtime.scope.setOption('particlesEnabled', true));
  await page.waitForFunction(() => document.querySelectorAll('.liang-skin-backdrop canvas').length === 1);
  await page.evaluate(() => window.__runtime.presenter.setFrame(48));
  await waitForPortrait(page, 'stage-06.webp', null, 'portrait-source-xianxia-v2');
  assert.equal(await page.locator('.liang-skin-backdrop canvas').count(), 1, 'Portrait frame swaps preserve the particle canvas');
  assert.equal(requests.length, afterPortraitChange, 'Particle changes and frame swaps do not reload portraits');
  await page.evaluate(() => {
    window.__runtime.particleCanvas = document.querySelector('.liang-skin-backdrop canvas');
    return window.__runtime.scope.setOption('particlesEnabled', false);
  });
  await page.waitForFunction(() => document.querySelectorAll('canvas').length === 0);
  assert.deepEqual(await page.evaluate(() => {
    const canvas = window.__runtime.particleCanvas;
    return { connected: canvas.isConnected, width: canvas.width, height: canvas.height };
  }), { connected: false, width: 0, height: 0 }, 'Turning particles off removes and releases the display canvas');

  await page.evaluate(() => window.__runtime.scope.setOption('motionEnabled', true));
  await page.waitForFunction(() => document.querySelector('.liang-skin-backdrop')?.dataset.motion === 'on');
  assert.equal(await page.locator('.liang-skin-backdrop').getAttribute('data-motion-state'), 'idle',
    'Opting into motion starts in the idle state');
  await page.evaluate(() => window.__runtime.scope.setOption('motionEnabled', false));
  assert.deepEqual(await page.evaluate(() => {
    const backdrop = document.querySelector('.liang-skin-backdrop');
    return { motion: backdrop.getAttribute('data-motion'), state: backdrop.getAttribute('data-motion-state'),
      opacity: backdrop.style.getPropertyValue('--liang-motion-opacity'), scale: backdrop.style.getPropertyValue('--liang-motion-scale') };
  }), { motion: null, state: null, opacity: '', scale: '' }, 'Turning motion off restores its markers and CSS properties');
  assert.equal(requests.length, afterPortraitChange, 'Motion is independent of portrait loading');

  const beforeOriginal = requests.length;
  await page.evaluate(() => window.__runtime.scope.setOption('xianxiaPortraits', false));
  await waitForPortrait(page, 'stage-06.webp');
  assert.ok(requests.slice(beforeOriginal).every(({ directory }) => directory === 'portrait-source-v2'),
    'Returning to the original portrait set only requests original images');
  assert.equal(await page.locator('canvas').count(), 0, 'Returning portraits preserves the particle off choice');
  assert.equal(await page.locator('.liang-skin-backdrop').getAttribute('data-motion'), null,
    'Returning portraits preserves the motion off choice');

  // Exercise teardown while both independent effects are active, with a real
  // canvas and detached-root reference so DOM removal alone cannot hide leaks.
  await page.evaluate(async () => {
    await window.__runtime.scope.update({ particlesEnabled: true, motionEnabled: true });
    window.__runtime.finalBackdrop = document.querySelector('.liang-skin-backdrop');
    window.__runtime.finalCanvas = document.querySelector('.liang-skin-backdrop canvas');
  });
  await test.dispose();
  await assertRemoved(page, true);
  assert.deepEqual(await page.evaluate(() => ({
    canvasConnected: window.__runtime.finalCanvas.isConnected,
    width: window.__runtime.finalCanvas.width,
    height: window.__runtime.finalCanvas.height,
    motion: window.__runtime.finalBackdrop.getAttribute('data-motion'),
    motionState: window.__runtime.finalBackdrop.getAttribute('data-motion-state'),
  })), { canvasConnected: false, width: 0, height: 0, motion: null, motionState: null },
  'Plugin disposal removes optional canvas resources and restores motion state');
}

async function assertNativeAppearance(page) {
  const result = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('.current_cubeRow > button')].map((button) => button.textContent),
    custom: document.querySelectorAll('.liang-appearance-choice').length,
    themeGets: window.__runtime.themeGets,
    themeSetCalls: window.__runtime.themeSetCalls,
    preference: window.__runtime.themePreference,
    expected: window.__runtime.expectedTheme,
    dark: document.body.hasAttribute('data-ds-dark-theme'),
  }));
  assert.deepEqual(result.buttons, ['浅色', '深色', '跟随系统'], 'General appearance keeps exactly the three native choices');
  assert.equal(result.custom, 0, 'The skin never injects a fourth appearance choice');
  assert.equal(result.themeGets, 0, 'The presenter does not retrieve the host theme service');
  assert.deepEqual(result.themeSetCalls, [], 'Activation, frame changes, and shutdown never write the host theme');
  assert.equal(result.preference, result.expected, 'The user’s native light/dark/system preference is preserved');
  assert.equal(result.dark, result.expected === 'dark', 'The skin does not override the host’s effective theme marker');
}

async function assertDisabledStartup(test) {
  const { page, requests } = test;
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(requests.length, 0, 'A persisted-off skin makes no portrait requests on startup');
  assert.equal(await page.evaluate(() => window.__runtime.decodedImages.length), 0, 'A persisted-off skin starts no image decodes');
  await assertRemoved(page);
  assert.equal(await page.evaluate(() => window.__runtime.activeSlots), 3,
    'Both settings entry points and the dormant conversation control remain registered');
  assert.equal(await page.evaluate(() => window.__runtime.scope.getSnapshot().enabled), false,
    'The real store restores the persisted master switch');

  await page.evaluate(() => window.__runtime.settings.props.scope.set(true));
  await page.waitForFunction(() => window.__runtime.decodedImages.length === 24, null, { timeout: 15000 });
  await waitForPortrait(page, 'stage-30.webp');
  assert.equal(requests.length, 24, 'Re-enabling from plugin settings loads the original 24 anchors normally');
  await assertNativeAppearance(page);
  await page.evaluate(async () => {
    await window.__runtime.settingsSection.props.scope.set(false);
    if (localStorage.getItem('dsh-liang-intensity-skin.enabled.v1') !== '0') throw new Error('Master switch was not persisted');
    // Recreate the plugin, as a refresh or loader reactivation does, while
    // retaining browser storage and the host's native theme preference.
    window.__runtime.dispose();
    window.__runtime.reapply();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  assert.equal(requests.length, 24, 'Reactivation preserves the off choice without starting new requests');
  await assertRemoved(page);
  assert.equal(await page.evaluate(() => window.__runtime.activeSlots), 3, 'Settings stay reachable after restoring the off choice');
  await assertNativeAppearance(page);
  await test.dispose();
  await assertRemoved(page, true);
}

async function assertNoErrors(test) {
  await assertNativeAppearance(test.page);
  assert.deepEqual(test.errors, [], 'No browser runtime exception');
  assert.deepEqual(await test.page.evaluate(() => window.__runtime.errors), [], 'No unhandled runtime promise rejection');
}

try {
  const success = await fixture();
  try {
    await success.page.waitForFunction(() => window.__runtime.decodedImages.length === 24, null, { timeout: 15000 });
    await waitForPortrait(success.page, 'stage-30.webp');
    await success.page.evaluate(() => {
      const current = document.querySelector('.fixture_centerCol');
      const replacement = document.createElement('div');
      replacement.className = 'fixture_centerCol';
      replacement.style.cssText = 'position:relative;min-height:100vh';
      const nativeAppearance = current?.querySelector('.current_group');
      if (nativeAppearance) replacement.append(nativeAppearance);
      current?.replaceWith(replacement);
    });
    await success.page.waitForFunction(() => document.querySelector('.fixture_centerCol > .liang-skin-backdrop') !== null);
    assert.equal(success.requests.length, 24, 'Decoded display nodes do not start duplicate requests');
    assert.equal(new Set(success.requests.map(({ name }) => name)).size, 24, 'Every shipped anchor is requested');
    await assertPluginSettings(success.page);
    await success.page.evaluate(() => window.__runtime.presenter.setFrame(48));
    await waitForPortrait(success.page, 'stage-06.webp');
    await success.page.evaluate(() => window.__runtime.presenter.choose(false));
    await assertRemoved(success.page);
    await success.page.evaluate(() => window.__runtime.presenter.choose(true));
    await waitForPortrait(success.page, 'stage-06.webp');
    await success.page.evaluate(() => window.__runtime.presenter.choose(false));
    const held = success.holdImages();
    await success.page.evaluate(() => window.__runtime.presenter.choose(true));
    await bounded(held.started.promise, 'Reactivation did not launch all 24 real image requests');
    await success.page.evaluate(() => window.__runtime.presenter.setFrame(240));
    await success.dispose();
    held.release.resolve();
    await bounded(held.finished.promise, 'Held image responses did not finish');
    await success.page.evaluate(async () => {
      await window.__runtime.presenter.choose(true);
      window.__runtime.presenter.setFrame(0);
      window.__runtime.dispose();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await assertRemoved(success.page, true);
    await assertNoErrors(success);
  } finally {
    await success.close();
  }

  for (const nativeTheme of ['light', 'dark', 'system']) {
    const disabled = await fixture({ enabled: false, nativeTheme });
    try {
      await assertDisabledStartup(disabled);
      await assertNoErrors(disabled);
    } finally {
      await disabled.close();
    }
  }

  const optional = await fixture();
  try {
    await assertOptionalEffects(optional);
    await assertNoErrors(optional);
  } finally {
    await optional.close();
  }

  const partial = await fixture({ fail: (name) => name === 'stage-12.webp' || name === 'level-01.webp' });
  try {
    await waitForPortrait(partial.page, 'stage-30.webp');
    const exhausted = partial.page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname.endsWith('/stage-12.webp') && url.searchParams.get('retry') === '3';
    }, { timeout: 15000 });
    await partial.page.evaluate(() => window.__runtime.presenter.setFrame(96));
    await exhausted;
    await partial.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await waitForPortrait(partial.page, 'stage-30.webp');
    assert.deepEqual(partial.requests.filter(({ name }) => name === 'stage-12.webp').map(({ retry }) => retry), [0, 1, 2, 3], 'A permanently failed target gets bounded cache-bypassing retries');
    await partial.dispose();
    await assertRemoved(partial.page, true);
    await assertNoErrors(partial);
  } finally {
    await partial.close();
  }

  const recovery = await fixture({ fail: (name, retry) => name === 'stage-00.webp' && retry === 0, holdRetry: 'stage-00.webp' });
  try {
    await waitForPortrait(recovery.page, 'stage-30.webp');
    await recovery.page.evaluate(() => window.__runtime.presenter.setFrame(0));
    await recovery.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await waitForPortrait(recovery.page, 'stage-30.webp');
    recovery.releaseRetries();
    await waitForPortrait(recovery.page, 'stage-00.webp', 1);
    assert.deepEqual(recovery.requests.filter(({ name }) => name === 'stage-00.webp').map(({ retry }) => retry), [0, 1], 'First-frame recovery retries the actual WebP request');
    await recovery.dispose();
    await assertRemoved(recovery.page, true);
    await assertNoErrors(recovery);
  } finally {
    await recovery.close();
  }
  console.log('PASS: built apply(ctx), native theme preservation, persisted master switch, 24 native WebP decodes, frame swaps, partial failure, first-frame retry, official plugin settings, opt-in portraits/particles/motion, disable/enable, and disposal with late responses.');
} finally {
  await browser.close();
}
