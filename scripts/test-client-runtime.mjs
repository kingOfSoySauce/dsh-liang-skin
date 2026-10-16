import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const assetPaths = manifest.files.filter((file) => /^assets\/portrait-source-v2\/[^/]+\.webp$/.test(file));
assert.equal(assetPaths.length, 24, 'The published client must contain all 24 portrait anchors');
const assets = new Map(assetPaths.map((file) => [file.split('/').at(-1), readFileSync(new URL(file, root))]));
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

async function fixture({ fail = () => false, holdRetry = null } = {}) {
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
    if (url.pathname === '/') {
      await route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="zh-CN"><head></head><body><main id="root"><section class="current_group"><div class="current_cubeRow"><button type="button" class="current_themeCube">浅色</button><button type="button" class="current_themeCube">深色</button><button type="button" class="current_themeCube">跟随系统</button></div></section></main></body></html>' });
      return;
    }
    const match = url.pathname.match(/^\/plugins\/.+\/assets\/portrait-source-v2\/([^/]+\.webp)$/);
    assert.ok(match && assets.has(match[1]), `Unexpected runtime request: ${url.pathname}`);
    const name = match[1];
    const retry = Number(url.searchParams.get('retry') ?? 0);
    requests.push({ name, retry, url: url.href });
    const currentHold = hold;
    if (currentHold !== null) {
      currentHold.count += 1;
      if (currentHold.count === assets.size) currentHold.started.resolve();
      await currentHold.release.promise;
    }
    if (name === holdRetry && retry > 0) await retriesReleased.promise;
    const unavailable = fail(name, retry);
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
  await page.evaluate(() => {
    const runtime = {
      cleanups: [], decoded: new WeakSet(), decodedImages: [],
      registered: null, scope: null, presenter: null, module: null,
      activeLocales: 0, activeSlots: 0, errors: [],
      registrations: new Map(), dictionaries: new Map(), binding: null,
      bindingHooks: [], bindingHookIndex: 0, renderingBinding: false,
    };
    window.__runtime = runtime;
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
    // This identity stands for the host's imported component. Never implement
    // its DOM or styles here: native Switch visuals are verified in real DSH.
    runtime.nativeSwitch = unexpectedRender;
    const jsx = (type, props, key) => ({ type, props, key });
    const useState = (initial) => {
      if (!runtime.renderingBinding) return unexpectedRender();
      const index = runtime.bindingHookIndex++;
      if (!(index in runtime.bindingHooks)) runtime.bindingHooks[index] = initial;
      return [runtime.bindingHooks[index], (next) => {
        runtime.bindingHooks[index] = typeof next === 'function' ? next(runtime.bindingHooks[index]) : next;
      }];
    };
    const useSyncExternalStore = (_subscribe, getSnapshot) => {
      if (!runtime.renderingBinding) return unexpectedRender();
      return getSnapshot();
    };
    window.__ModuleLoader__ = {
      load({ id, factory }) {
        runtime.moduleId = id;
        runtime.module = factory((name) => {
          if (name === 'react') return {
            useEffect: unexpectedRender, useMemo: unexpectedRender,
            useRef: unexpectedRender, useState,
            useSyncExternalStore,
          };
          if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
          if (name === '@deepseek-ai/dsh-client-ui-primitives') return { Switch: runtime.nativeSwitch };
          throw new Error(`Unexpected client import: ${name}`);
        });
      },
    };
  });
  await page.addScriptTag({ content: client });
  await page.evaluate(() => {
    const runtime = window.__runtime;
    let preference = 'system';
    const theme = {
      getTheme: () => ({ preference }),
      setTheme: (next) => {
        preference = next;
        document.body.toggleAttribute('data-ds-dark-theme', next === 'dark');
      },
    };
    const ctx = {
      effect(setup) {
        const cleanup = setup();
        if (typeof cleanup === 'function') runtime.cleanups.push(cleanup);
      },
      get(name) {
        if (name === 'theme') return theme;
        throw new Error(`Unexpected host service: ${name}`);
      },
      locale: {
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
          runtime.registrations.set(definition.id, registration);
          if (definition.id === 'liang-intensity-control') {
            runtime.registered = props;
            runtime.scope = props.scope;
            runtime.presenter = props.presenter;
          } else if (definition.id === 'liang-effort-binding') {
            runtime.binding = registration;
          } else {
            throw new Error(`Unexpected client slot: ${definition.id}`);
          }
          return () => {
            runtime.activeSlots -= 1;
            runtime.registrations.delete(definition.id);
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
    runtime.renderBinding = (language = 'zh') => {
      if (runtime.binding === null) throw new Error('The native binding row was not registered');
      const { definition, component, props } = runtime.binding;
      runtime.bindingHookIndex = 0;
      runtime.renderingBinding = true;
      try {
        return component({ ...props, t: (key) => runtime.dictionaries.get(definition.locale)?.[language]?.[key] ?? key });
      } finally {
        runtime.renderingBinding = false;
      }
    };
    runtime.dispose = () => {
      for (const cleanup of runtime.cleanups.splice(0).reverse()) cleanup();
    };
  });
  assert.equal(await page.getAttribute('body', 'data-liang-skin'), 'on', 'apply(ctx) enables the real presenter');
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

async function waitForPortrait(page, filename, retry = null) {
  await page.waitForFunction(({ selector, filename, retry }) => {
    const image = document.querySelector(selector);
    if (!(image instanceof HTMLImageElement) || !image.currentSrc || !image.complete || image.naturalWidth === 0) return false;
    const url = new URL(image.currentSrc);
    return url.pathname.endsWith(`/${filename}`)
      && (retry === null || url.searchParams.get('retry') === String(retry))
      && window.__runtime.decoded.has(image)
      && getComputedStyle(image).display !== 'none'
      && image.getBoundingClientRect().height > 0;
  }, { selector: imageSelector, filename, retry }, { timeout: 15000 });
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
    bindingVisible: !fullyDisposed && window.__runtime.renderBinding() !== null,
  }), fullyDisposed);
  assert.equal(result.backdrop, 0, 'No portrait backdrop remains');
  assert.equal(result.skin, false, 'Skin marker is removed');
  assert.equal(result.stage, false, 'Stage marker is removed');
  assert.deepEqual(result.variables, [], 'All presenter CSS variables are removed');
  assert.equal(result.retainedSources, 0, 'Decoded images release their network sources');
  assert.equal(result.bindingVisible, false, 'The binding slot returns null while the skin is off');
  if (fullyDisposed) {
    assert.equal(result.styles, 0, 'Client stylesheet is removed');
    assert.equal(result.controls, 0, 'Appearance controls are removed');
    assert.equal(result.locales, 0, 'Locale registration is released');
    assert.equal(result.slots, 0, 'Slot registration is released');
  }
}

async function assertNativeBinding(page) {
  const result = await page.evaluate(async () => {
    const runtime = window.__runtime;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
    const binding = runtime.binding;
    check(binding?.definition.name === 'settings.general.item'
      && binding.definition.id === 'liang-effort-binding'
      && binding.definition.order === 10.5, 'Binding uses the native General Settings slot after appearance');
    check(binding.props.scope === runtime.scope, 'Binding and portrait share the real preference store');
    const controls = (language = 'zh') => {
      const tree = runtime.renderBinding(language);
      const nodes = [];
      const visit = (node) => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (node === null || typeof node !== 'object') return;
        nodes.push(node);
        visit(node.props?.children);
      };
      visit(tree);
      const switches = nodes.filter((node) => node.type === runtime.nativeSwitch);
      check(switches.length === 1, 'Binding must reference the imported host Switch exactly once');
      check(tree.type === 'div', 'The binding row is a non-interactive div');
      check(nodes.every((node) => !['input', 'button', 'label'].includes(node.type)
        && node.props?.onClick === undefined && node.props?.htmlFor === undefined),
      'No hand-drawn switch or whole-row/text click handler');
      check(switches[0].props.className === undefined && switches[0].props.style === undefined,
        'Native Switch receives no skin shape or color overrides');
      const text = nodes.find((node) => node.type === 'span');
      check(text?.props.children === switches[0].props.label, 'Visible text is the native Switch accessible name');
      return { text, control: switches[0] };
    };
    let { text, control } = controls();
    check(text.props.children === '滑动变祖绑定思考等级', 'Original Chinese binding label is preserved');
    check(controls('en').text.props.children === 'Bind slider to reasoning level', 'English binding label comes from locale');
    check(control.props.checked === true && control.props.disabled === false, 'Binding starts with persisted state');
    text.props.onClick?.();
    check(runtime.scope.getSnapshot().bindEffort === true, 'Text has no binding write callback');
    control.props.onChange(false);
    check(controls().control.props.disabled === true, 'Native Switch is disabled while saving');
    await flush();
    control = controls().control;
    check(runtime.scope.getSnapshot().bindEffort === false && control.props.checked === false
      && control.props.disabled === false, 'Only Switch onChange writes the binding preference');
    const setBindEffort = runtime.scope.setBindEffort;
    let rejectWrite, writes = 0;
    runtime.scope.setBindEffort = () => {
      writes += 1;
      return new Promise((_, reject) => { rejectWrite = reject; });
    };
    try {
      control.props.onChange(true);
      control = controls().control;
      check(control.props.disabled === true, 'Pending write keeps the native control disabled');
      control.props.onChange(true);
      check(writes === 1, 'Pending change cannot enqueue a second write');
      rejectWrite(new Error('fixture: binding write rejected'));
      await flush();
      control = controls().control;
      check(control.props.checked === false && control.props.disabled === false,
        'Failed write preserves accepted state and unlocks the native control');
    } finally {
      runtime.scope.setBindEffort = setBindEffort;
    }
    control.props.onChange(true);
    await flush();
    check(runtime.scope.getSnapshot().bindEffort === true, 'Binding remains usable after a failed write');
    return { passed: true, slots: runtime.activeSlots };
  });
  assert.equal(result.passed, true);
  assert.equal(result.slots, 2, 'Runtime registers both conversation and native binding slots');
}

async function assertNoErrors(test) {
  assert.deepEqual(test.errors, [], 'No browser runtime exception');
  assert.deepEqual(await test.page.evaluate(() => window.__runtime.errors), [], 'No unhandled runtime promise rejection');
}

try {
  const success = await fixture();
  try {
    await success.page.waitForFunction(() => window.__runtime.decodedImages.length === 24, null, { timeout: 15000 });
    await waitForPortrait(success.page, 'stage-30.webp');
    assert.equal(success.requests.length, 24, 'Decoded display nodes do not start duplicate requests');
    assert.equal(new Set(success.requests.map(({ name }) => name)).size, 24, 'Every shipped anchor is requested');
    await assertNativeBinding(success.page);
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
  console.log('PASS: built apply(ctx), 24 native WebP decodes, frame swaps, partial failure, first-frame retry, native Switch binding contract, disable/enable, and disposal with late responses.');
} finally {
  await browser.close();
}
