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
    const unexpectedRender = () => { throw new Error('The runtime fixture must not render React components'); };
    window.__ModuleLoader__ = {
      load({ id, factory }) {
        runtime.moduleId = id;
        runtime.module = factory((name) => {
          if (name === 'react') return {
            useEffect: unexpectedRender, useMemo: unexpectedRender,
            useRef: unexpectedRender, useState: unexpectedRender,
            useSyncExternalStore: unexpectedRender,
          };
          if (name === 'react/jsx-runtime') return { jsx: unexpectedRender, jsxs: unexpectedRender };
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
        register() {
          runtime.activeLocales += 1;
          return () => { runtime.activeLocales -= 1; };
        },
      },
      slots: {
        inject(name, callback) {
          const cleanup = callback();
          if (typeof cleanup === 'function') runtime.cleanups.push(cleanup);
        },
        register(definition) {
          runtime.activeSlots += 1;
          runtime.registered = definition.inject('fixture-session');
          runtime.scope = runtime.registered.scope;
          runtime.presenter = runtime.registered.presenter;
          return () => { runtime.activeSlots -= 1; };
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
  const result = await page.evaluate(() => ({
    backdrop: document.querySelectorAll('.liang-skin-backdrop').length,
    skin: document.body.hasAttribute('data-liang-skin'),
    stage: document.body.hasAttribute('data-liang-stage'),
    variables: [...document.body.style].filter((name) => name.startsWith('--liang-')),
    retainedSources: window.__runtime.decodedImages.filter((image) => image.hasAttribute('src')).length,
    styles: [...document.head.querySelectorAll('style')].filter((style) => style.dataset.plugin).length,
    controls: document.querySelectorAll('.liang-appearance-choice, .liang-appearance-binding').length,
    locales: window.__runtime.activeLocales,
    slots: window.__runtime.activeSlots,
  }));
  assert.equal(result.backdrop, 0, 'No portrait backdrop remains');
  assert.equal(result.skin, false, 'Skin marker is removed');
  assert.equal(result.stage, false, 'Stage marker is removed');
  assert.deepEqual(result.variables, [], 'All presenter CSS variables are removed');
  assert.equal(result.retainedSources, 0, 'Decoded images release their network sources');
  if (fullyDisposed) {
    assert.equal(result.styles, 0, 'Client stylesheet is removed');
    assert.equal(result.controls, 0, 'Appearance controls are removed');
    assert.equal(result.locales, 0, 'Locale registration is released');
    assert.equal(result.slots, 0, 'Slot registration is released');
  }
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
  console.log('PASS: built apply(ctx), 24 native WebP decodes, frame swaps, partial failure, first-frame retry, disable/enable, and disposal with late responses.');
} finally {
  await browser.close();
}
