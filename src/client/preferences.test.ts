import { afterEach, describe, expect, it, vi } from "vitest";
import { createPreferenceStore, DEFAULT_SKIN_SETTINGS, ENABLED_STORAGE_KEY, PREFERENCE_STORAGE_KEY } from "./preferences";

const LEGACY_BIND = "dsh-liang-intensity-skin.bind-effort";
const LEGACY_MASK = "dsh-liang-intensity-skin.mask";

function browser(seed: Record<string, string> = {}) {
  const items = new Map(Object.entries(seed));
  const target = new EventTarget();
  const storage = {
    getItem: vi.fn((key: string) => items.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { items.set(key, value); }),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", target);
  const add = vi.spyOn(target, "addEventListener");
  const remove = vi.spyOn(target, "removeEventListener");
  return {
    storage, items, add, remove,
    event(key: string | null, value: string | null, area: unknown = storage) {
      if (key === null) items.clear();
      else if (value === null) items.delete(key);
      else items.set(key, value);
      target.dispatchEvent(Object.assign(new Event("storage"), { key, newValue: value, storageArea: area }));
    },
  };
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("independent skin preferences", () => {
  it("starts with only binding and scrim enabled and ignores old activation choices", () => {
    const env = browser({ "dsh-liang-intensity-skin.enabled": "0" });
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toEqual(DEFAULT_SKIN_SETTINGS);
    expect(env.storage.setItem).not.toHaveBeenCalled();
    store.dispose();
  });

  it("migrates legacy preferences on the first save without changing the other effects", async () => {
    const env = browser({ [LEGACY_BIND]: "0", [LEGACY_MASK]: "0" });
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toMatchObject({ bindEffort: false, maskEnabled: false, fineStopsEnabled: false });
    const changed = vi.fn();
    store.subscribe(changed);
    await store.update({ xianxiaPortraits: true, particlesEnabled: true });
    expect(env.storage.setItem).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(1);
    const record = JSON.parse(env.items.get(PREFERENCE_STORAGE_KEY)!);
    expect(record.version).toBe(1);
    expect(record.values).toEqual({ bindEffort: false, maskEnabled: false, xianxiaPortraits: true,
      particlesEnabled: true, motionEnabled: false, fineStopsEnabled: false, hideSlider: false });
    expect(record.values).not.toHaveProperty("enabled");
    expect(env.items.get(LEGACY_BIND)).toBe("0");
    store.dispose();
    const restored = createPreferenceStore();
    expect(restored.getSnapshot()).toEqual({ enabled: true, ...record.values });
    restored.dispose();
  });

  it("keeps all six existing v1 choices when adding a persistent hide-slider preference", async () => {
    const previous = {
      bindEffort: false, maskEnabled: true, xianxiaPortraits: true,
      particlesEnabled: false, motionEnabled: true, fineStopsEnabled: true,
    };
    const env = browser({ [PREFERENCE_STORAGE_KEY]: JSON.stringify({ version: 1, values: previous }) });
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toEqual({ enabled: true, ...previous, hideSlider: false });
    expect(env.storage.setItem).not.toHaveBeenCalled();
    await store.setOption("hideSlider", true);
    expect(store.getSnapshot()).toEqual({ enabled: true, ...previous, hideSlider: true });
    expect(JSON.parse(env.items.get(PREFERENCE_STORAGE_KEY)!)).toEqual({
      version: 1, values: { ...previous, hideSlider: true },
    });
    store.dispose();
    const restored = createPreferenceStore();
    expect(restored.getSnapshot()).toEqual({ enabled: true, ...previous, hideSlider: true });
    env.event(PREFERENCE_STORAGE_KEY, JSON.stringify({ version: 1, values: { ...previous, hideSlider: false } }));
    expect(restored.getSnapshot()).toEqual({ enabled: true, ...previous, hideSlider: false });
    restored.dispose();
  });

  it("prefers valid versioned settings and restores the independent master switch", async () => {
    browser({ [LEGACY_BIND]: "0", [LEGACY_MASK]: "0", [PREFERENCE_STORAGE_KEY]: JSON.stringify({
      version: 1, values: { bindEffort: true, maskEnabled: true, fineStopsEnabled: true, particlesEnabled: "yes" },
    }) });
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toEqual({ ...DEFAULT_SKIN_SETTINGS, fineStopsEnabled: true });
    await store.set(false);
    await store.setOption("motionEnabled", true);
    store.dispose();
    const restored = createPreferenceStore();
    expect(restored.getSnapshot()).toMatchObject({ enabled: false, motionEnabled: true, fineStopsEnabled: true, particlesEnabled: false });
    restored.dispose();
  });

  it("handles inaccessible storage reads and rejects unavailable writes without applying them", async () => {
    const env = browser();
    env.storage.getItem.mockImplementation(() => { throw new Error("denied"); });
    env.storage.setItem.mockImplementation(() => { throw new Error("denied"); });
    const store = createPreferenceStore();
    const initial = store.getSnapshot();
    const changed = vi.fn();
    store.subscribe(changed);
    await expect(store.update({ bindEffort: false, motionEnabled: true })).rejects.toThrow("denied");
    expect(store.getSnapshot()).toBe(initial);
    expect(changed).not.toHaveBeenCalled();
    await expect(store.set(false)).rejects.toThrow("denied");
    expect(store.getSnapshot()).toBe(initial);
    store.dispose();
  });

  it("loads with no localStorage global and leaves a failed save unapplied", async () => {
    const env = browser();
    vi.stubGlobal("localStorage", undefined);
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toEqual(DEFAULT_SKIN_SETTINGS);
    await expect(store.setMaskEnabled(false)).rejects.toThrow("unavailable");
    await expect(store.set(false)).rejects.toThrow("unavailable");
    expect(store.getSnapshot().maskEnabled).toBe(true);
    expect(env.storage.setItem).not.toHaveBeenCalled();
    store.dispose();
  });

  it("falls back safely from malformed or unsupported stored records", () => {
    const env = browser({ [PREFERENCE_STORAGE_KEY]: "{broken", [LEGACY_MASK]: "0" });
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toEqual({ ...DEFAULT_SKIN_SETTINGS, maskEnabled: false });
    store.dispose();
    env.items.set(PREFERENCE_STORAGE_KEY, JSON.stringify({ version: 99, values: { particlesEnabled: true } }));
    const future = createPreferenceStore();
    expect(future.getSnapshot().particlesEnabled).toBe(false);
    future.dispose();
  });

  it("syncs versioned saves across pages once and ignores stale legacy events", async () => {
    const env = browser();
    const store = createPreferenceStore();
    await store.set(false);
    const changed = vi.fn();
    store.subscribe(changed);
    env.event(LEGACY_BIND, "0");
    expect(store.getSnapshot().bindEffort).toBe(false);
    const record = JSON.stringify({ version: 1, values: {
      bindEffort: true, maskEnabled: false, xianxiaPortraits: true,
      particlesEnabled: true, motionEnabled: false, fineStopsEnabled: true,
    } });
    env.event(PREFERENCE_STORAGE_KEY, record);
    expect(store.getSnapshot()).toEqual({ enabled: false, ...JSON.parse(record).values, hideSlider: false });
    const count = changed.mock.calls.length;
    env.event(PREFERENCE_STORAGE_KEY, record);
    env.event(LEGACY_BIND, "0");
    expect(changed).toHaveBeenCalledTimes(count);
    expect(store.getSnapshot().bindEffort).toBe(true);
    env.event(null, null);
    expect(store.getSnapshot()).toEqual(DEFAULT_SKIN_SETTINGS);
    store.dispose();
  });

  it("removes storage listeners and stops writes or notifications after disposal", async () => {
    const env = browser();
    const store = createPreferenceStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    await store.setBindEffort(false);
    unsubscribe();
    await store.setMaskEnabled(false);
    expect(listener).toHaveBeenCalledTimes(1);
    const before = store.getSnapshot();
    store.dispose(); store.dispose();
    const registered = env.add.mock.calls.find(([name]) => name === "storage")!;
    expect(env.remove).toHaveBeenCalledWith("storage", registered[1]);
    env.storage.setItem.mockClear();
    env.event(null, null);
    await store.setOption("particlesEnabled", true);
    await store.set(true);
    expect(store.getSnapshot()).toBe(before);
    expect(env.storage.setItem).not.toHaveBeenCalled();
  });

  it("ignores session storage and unrelated keys", () => {
    const env = browser();
    const store = createPreferenceStore();
    const before = store.getSnapshot();
    env.event(LEGACY_BIND, "0", {});
    env.event("other-plugin", "0");
    expect(store.getSnapshot()).toBe(before);
    store.dispose();
  });

  it("persists the master switch without rewriting any of the seven option values", async () => {
    const previous = { bindEffort: false, maskEnabled: false, xianxiaPortraits: true,
      particlesEnabled: true, motionEnabled: true, fineStopsEnabled: true, hideSlider: true };
    const record = JSON.stringify({ version: 1, values: previous });
    const env = browser({ [PREFERENCE_STORAGE_KEY]: record });
    const store = createPreferenceStore();
    const changed = vi.fn();
    store.subscribe(changed);
    await store.set(false);
    expect(env.storage.setItem).toHaveBeenCalledExactlyOnceWith(ENABLED_STORAGE_KEY, "0");
    expect(changed).toHaveBeenCalledTimes(1);
    expect(env.items.get(PREFERENCE_STORAGE_KEY)).toBe(record);
    expect(store.getSnapshot()).toEqual({ enabled: false, ...previous });
    await store.set(false);
    expect(changed).toHaveBeenCalledTimes(1);
    store.dispose();
    const restored = createPreferenceStore();
    expect(restored.getSnapshot()).toEqual({ enabled: false, ...previous });
    await restored.set(true);
    expect(env.items.get(ENABLED_STORAGE_KEY)).toBe("1");
    expect(restored.getSnapshot()).toEqual({ enabled: true, ...previous });
    restored.dispose();
  });

  it("syncs the master switch across pages without letting older option records reset it", () => {
    const env = browser({ [ENABLED_STORAGE_KEY]: "0", "dsh-liang-intensity-skin.enabled": "1" });
    const store = createPreferenceStore();
    const changed = vi.fn();
    store.subscribe(changed);
    expect(store.getSnapshot().enabled).toBe(false);
    env.event(PREFERENCE_STORAGE_KEY, JSON.stringify({ version: 1, values: { bindEffort: false, enabled: true } }));
    expect(store.getSnapshot()).toMatchObject({ enabled: false, bindEffort: false });
    env.event(ENABLED_STORAGE_KEY, "1");
    expect(store.getSnapshot()).toMatchObject({ enabled: true, bindEffort: false });
    env.event(ENABLED_STORAGE_KEY, "0");
    env.event("dsh-liang-intensity-skin.enabled", "1");
    expect(store.getSnapshot().enabled).toBe(false);
    env.event(ENABLED_STORAGE_KEY, null);
    expect(store.getSnapshot()).toMatchObject({ enabled: true, bindEffort: false });
    env.event(ENABLED_STORAGE_KEY, "0");
    env.event(null, null);
    expect(store.getSnapshot()).toEqual(DEFAULT_SKIN_SETTINGS);
    const count = changed.mock.calls.length;
    store.dispose();
    env.event(ENABLED_STORAGE_KEY, "0");
    expect(changed).toHaveBeenCalledTimes(count);
    expect(store.getSnapshot()).toEqual(DEFAULT_SKIN_SETTINGS);
  });

  it("loads defaults when accessing localStorage itself is blocked", async () => {
    const env = browser();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() { throw new Error("storage access denied"); },
    });
    const store = createPreferenceStore();
    expect(store.getSnapshot()).toEqual(DEFAULT_SKIN_SETTINGS);
    await expect(store.set(false)).rejects.toThrow("unavailable");
    expect(store.getSnapshot().enabled).toBe(true);
    expect(env.storage.setItem).not.toHaveBeenCalled();
    store.dispose();
  });
});
