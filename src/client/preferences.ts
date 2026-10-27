export interface SkinSettings {
  enabled: boolean;
  bindEffort: boolean;
  maskEnabled: boolean;
  xianxiaPortraits: boolean;
  particlesEnabled: boolean;
  motionEnabled: boolean;
  fineStopsEnabled: boolean;
  hideSlider: boolean;
}

export type OptionalSetting = "xianxiaPortraits" | "particlesEnabled" | "motionEnabled" | "fineStopsEnabled" | "hideSlider";
export type PersistentSettings = Omit<SkinSettings, "enabled">;

export interface PreferenceStore {
  getSnapshot(): SkinSettings;
  subscribe(listener: () => void): () => void;
  set(enabled: boolean): Promise<void>;
  setBindEffort(enabled: boolean): Promise<void>;
  setMaskEnabled(enabled: boolean): Promise<void>;
  setOption(key: OptionalSetting, enabled: boolean): Promise<void>;
  update(settings: Partial<PersistentSettings>): Promise<void>;
  dispose(): void;
}

export const PREFERENCE_STORAGE_KEY = "dsh-liang-intensity-skin.settings.v1";
// Keep activation separate so older clients writing the option record cannot
// accidentally re-enable a skin that the user has switched off.
export const ENABLED_STORAGE_KEY = "dsh-liang-intensity-skin.enabled.v1";
const BIND_EFFORT_KEY = "dsh-liang-intensity-skin.bind-effort";
const MASK_KEY = "dsh-liang-intensity-skin.mask";

export const DEFAULT_SKIN_SETTINGS: Readonly<SkinSettings> = Object.freeze({
  enabled: true,
  bindEffort: true,
  maskEnabled: true,
  // Optional visual effects never enable one another or change reasoning.
  xianxiaPortraits: false,
  particlesEnabled: false,
  motionEnabled: false,
  fineStopsEnabled: false,
  hideSlider: false,
});

const PERSISTENT_KEYS = [
  "bindEffort", "maskEnabled", "xianxiaPortraits", "particlesEnabled", "motionEnabled", "fineStopsEnabled", "hideSlider",
] as const;

export function persistentSettings(settings: SkinSettings): PersistentSettings {
  return Object.fromEntries(PERSISTENT_KEYS.map((key) => [key, settings[key]])) as PersistentSettings;
}

function getStorage(): Storage | null {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

function read(storage: Storage | null, key: string): string | null {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}

function readEnabled(storage: Storage | null) {
  return read(storage, ENABLED_STORAGE_KEY) !== "0";
}

function parse(raw: string | null): PersistentSettings | null {
  if (raw === null) return null;
  try {
    const record: unknown = JSON.parse(raw);
    if (record === null || typeof record !== "object"
      || !("version" in record) || record.version !== 1
      || !("values" in record) || record.values === null || typeof record.values !== "object") return null;
    const values = record.values as Record<string, unknown>;
    const result = persistentSettings(DEFAULT_SKIN_SETTINGS);
    for (const key of PERSISTENT_KEYS) {
      if (typeof values[key] === "boolean") result[key] = values[key];
    }
    return result;
  } catch { return null; }
}

function load(storage: Storage | null) {
  const versioned = parse(read(storage, PREFERENCE_STORAGE_KEY));
  return {
    versioned: versioned !== null,
    values: versioned ?? {
      ...persistentSettings(DEFAULT_SKIN_SETTINGS),
      bindEffort: read(storage, BIND_EFFORT_KEY) !== "0",
      maskEnabled: read(storage, MASK_KEY) !== "0",
    },
  };
}

/** Browser-local preferences, independent of the plugin Loader's active state. */
export function createPreferenceStore(): PreferenceStore {
  const storage = getStorage();
  const initial = load(storage);
  let hasVersioned = initial.versioned;
  let snapshot: SkinSettings = { enabled: readEnabled(storage), ...initial.values };
  let disposed = false;
  const listeners = new Set<() => void>();

  const apply = (values: Partial<SkinSettings>) => {
    if (disposed || Object.entries(values).every(([key, value]) => snapshot[key as keyof SkinSettings] === value)) return;
    snapshot = { ...snapshot, ...values };
    for (const listener of listeners) listener();
  };

  const onStorage = (event: StorageEvent) => {
    if (disposed || (event.storageArea != null && event.storageArea !== storage)) return;
    if (event.key === ENABLED_STORAGE_KEY) {
      apply({ enabled: event.newValue !== "0" });
    } else if (event.key === PREFERENCE_STORAGE_KEY) {
      const next = parse(event.newValue);
      const fallback = next === null ? load(storage) : null;
      hasVersioned = next !== null || fallback?.versioned === true;
      apply(next ?? fallback!.values);
    } else if (event.key === null) {
      const next = load(storage);
      hasVersioned = next.versioned;
      apply({ enabled: readEnabled(storage), ...next.values });
    } else if (!hasVersioned && (event.key === BIND_EFFORT_KEY || event.key === MASK_KEY)) {
      const current = load(storage);
      if (current.versioned) {
        hasVersioned = true;
        apply(current.values);
      } else {
        apply({ [event.key === BIND_EFFORT_KEY ? "bindEffort" : "maskEnabled"]: event.newValue !== "0" });
      }
    }
  };
  const target = typeof window === "undefined" ? null : window;
  target?.addEventListener("storage", onStorage);

  const update = async (patch: Partial<PersistentSettings>) => {
    if (disposed) return;
    for (const [key, value] of Object.entries(patch)) {
      if (!PERSISTENT_KEYS.includes(key as typeof PERSISTENT_KEYS[number]) || typeof value !== "boolean") {
        throw new TypeError("Invalid Liang setting");
      }
    }
    const values = { ...persistentSettings(snapshot), ...patch };
    if (PERSISTENT_KEYS.every((key) => values[key] === snapshot[key])) return;
    // One save is one durable write and one notification. A failed write must
    // not apply a partial selection or make the UI report it as saved.
    if (storage === null) throw new Error("Local settings storage is unavailable");
    storage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify({ version: 1, values }));
    hasVersioned = true;
    apply(values);
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    async set(enabled) {
      if (disposed || snapshot.enabled === enabled) return;
      if (storage === null) throw new Error("Local settings storage is unavailable");
      storage.setItem(ENABLED_STORAGE_KEY, enabled ? "1" : "0");
      apply({ enabled });
    },
    setBindEffort: (bindEffort) => update({ bindEffort }),
    setMaskEnabled: (maskEnabled) => update({ maskEnabled }),
    setOption: (key, value) => update({ [key]: value }),
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      target?.removeEventListener("storage", onStorage);
      listeners.clear();
    },
  };
}
