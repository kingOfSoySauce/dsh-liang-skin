export const SKIN_PACKAGE = "@leon___/dsh-client-liang-intensity-skin";
export const SKIN_LATEST_URL = `https://registry.npmjs.org/${encodeURIComponent(SKIN_PACKAGE)}/latest`;

export interface PluginManagerLike {
  listBundles(): Promise<unknown>;
  installBundle(spec: string, options: { enabled: boolean; requestId: string }): Promise<unknown>;
  waitForInstall?(requestId: string): Promise<unknown>;
}

export type SkinUpdatePhase = "idle" | "checking" | "available" | "current" | "installing"
  | "applied" | "restart-required" | "overridden" | "failed" | "cancelled" | "unknown";

export interface SkinUpdateSnapshot {
  readonly phase: SkinUpdatePhase;
  readonly loadedVersion: string;
  readonly installedVersion: string | null;
  readonly latestVersion: string | null;
  readonly targetVersion: string | null;
  readonly spec: string | null;
  readonly canInstall: boolean;
  readonly busy: boolean;
  readonly error: string | null;
  readonly managerAvailable: boolean;
}

export interface SkinUpdaterStore {
  getSnapshot(): SkinUpdateSnapshot;
  subscribe(listener: () => void): () => void;
  check(): Promise<void>;
  install(): Promise<void>;
  dispose(): void;
}

interface Options {
  loadedVersion: string;
  manager?: PluginManagerLike | (() => PluginManagerLike | undefined);
  fetchLatest?: typeof fetch;
}

const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

function versionParts(version: string) {
  if (version.length > 256) throw new Error("Invalid semantic version");
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(version);
  if (match === null) throw new Error("Invalid semantic version");
  const prerelease = match[4]?.split(".") ?? [];
  if (prerelease.some(part => /^\d+$/.test(part) && part.length > 1 && part.startsWith("0"))) {
    throw new Error("Invalid semantic version");
  }
  return { core: match.slice(1, 4), prerelease };
}

const numericCompare = (left: string, right: string) => left.length !== right.length
  ? Math.sign(left.length - right.length) : left === right ? 0 : left < right ? -1 : 1;

/** Strict SemVer precedence, including numeric prerelease identifiers and build metadata. */
export function compareSkinVersions(left: string, right: string): number {
  const a = versionParts(left), b = versionParts(right);
  for (let index = 0; index < 3; index += 1) {
    const compared = numericCompare(a.core[index], b.core[index]);
    if (compared !== 0) return compared;
  }
  if (a.prerelease.length === 0 || b.prerelease.length === 0) {
    return a.prerelease.length === b.prerelease.length ? 0 : a.prerelease.length === 0 ? 1 : -1;
  }
  for (let index = 0; index < Math.max(a.prerelease.length, b.prerelease.length); index += 1) {
    const x = a.prerelease[index], y = b.prerelease[index];
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
    if (x === y) continue;
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    return xn && yn ? numericCompare(x, y) : xn !== yn ? xn ? -1 : 1 : x < y ? -1 : 1;
  }
  return 0;
}

function unwrap(value: unknown): unknown {
  const result = object(value);
  if (result?.ok === false) throw new Error("Remote request failed");
  return result?.ok === true ? result.value : value;
}

function bounded<T>(work: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Read timed out")), 10_000);
    work.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

interface Bundle {
  version: string;
  enabled: boolean;
  identity: string;
  installable: boolean;
}

async function readBundle(manager: PluginManagerLike): Promise<Bundle | null> {
  const values = unwrap(await bounded(manager.listBundles()));
  if (!Array.isArray(values)) throw new Error("Invalid bundle inventory");
  const matches = values.filter(value => object(value)?.name === SKIN_PACKAGE);
  if (matches.length === 0) return null;
  const value = object(matches[0])!;
  if (matches.length !== 1 || typeof value.version !== "string" || typeof value.enabled !== "boolean"
    || typeof value.installed !== "boolean" || typeof value.optional !== "boolean"
    || !Array.isArray(value.rows) || !Array.isArray(value.overrides)
    || value.overrides.some(item => typeof item !== "string")
    || (value.source !== undefined && typeof value.source !== "string")) throw new Error("Invalid bundle inventory");
  versionParts(value.version);
  const rows = value.rows.map(row => {
    const item = object(row);
    if (typeof item?.rowId !== "string" || typeof item.moduleName !== "string") throw new Error("Invalid bundle row");
    return [item.rowId, item.moduleName];
  });
  // Desktop rc.2 exposes source; older Web does not. Never infer an absent
  // installation spec, or put source paths/diagnostics into public UI state.
  const identity = JSON.stringify([value.version, value.enabled, value.installed, value.optional,
    value.source ?? null, value.availability ?? null, value.official ?? null,
    value.readOnlyReason ?? null, object(value.error)?.code ?? null, rows, value.overrides]);
  return {
    version: value.version, enabled: value.enabled, identity,
    installable: value.installed && value.readOnlyReason === undefined && value.error === undefined && value.availability !== "missing",
  };
}

const UNKNOWN = "更新结果尚未确认。请先核对更新状态，期间不会重复安装。";
const MANAGER_MISSING = "当前宿主未提供可用的更新接口，请通过皮肤市场更新。";
const refusal = (code: unknown) => code === "already-installed"
  ? "当前宿主不允许覆盖已安装的皮肤，请改用皮肤市场更新。"
  : code === "incompatible-version" ? "宿主拒绝了不兼容的更新，请核对 DSH 与皮肤版本。"
  : code === "stop-profile" || code === "bundle-in-use" ? "宿主要求先停止正在使用的插件，请通过皮肤市场或插件管理器处理。"
  : code === "management-required" || code === "not-removable" ? "宿主不允许修改此插件，请在插件管理器查看。"
  : "宿主未能完成更新，请在皮肤市场或插件管理器查看原因。";

interface CheckedTarget { version: string; spec: string; before: Bundle }
interface Uncertain { target: CheckedTarget }

/** One controller per client activation, shared by both settings entry points. */
export function createSkinUpdater(options: Options): SkinUpdaterStore {
  versionParts(options.loadedVersion);
  const getManager = () => {
    try {
      const value = typeof options.manager === "function" ? options.manager() : options.manager;
      return typeof value?.listBundles === "function" && typeof value.installBundle === "function" ? value : undefined;
    } catch { return undefined; }
  };
  let snapshot: SkinUpdateSnapshot = Object.freeze({
    phase: "idle", loadedVersion: options.loadedVersion, installedVersion: null,
    latestVersion: null, targetVersion: null, spec: null, canInstall: false,
    busy: false, error: null, managerAvailable: getManager() !== undefined,
  });
  let target: CheckedTarget | null = null;
  let uncertain: Uncertain | null = null;
  let busy = false;
  let disposed = false;
  let checkAbort: AbortController | null = null;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<SkinUpdateSnapshot>) => {
    if (disposed) return;
    snapshot = Object.freeze({ ...snapshot, ...patch });
    for (const listener of [...listeners]) {
      try { listener(); } catch { /* An unmounted view must not stop the operation. */ }
    }
  };
  const newest = (bundle: Bundle | null) => bundle !== null && compareSkinVersions(bundle.version, options.loadedVersion) > 0
    ? bundle.version : options.loadedVersion;
  const markUnknown = (checked: CheckedTarget) => {
    uncertain = { target: checked };
    publish({ phase: "unknown", canInstall: false, busy: false, error: UNKNOWN });
  };

  const check = async () => {
    if (disposed || busy) return;
    busy = true;
    target = null;
    const manager = getManager();
    publish({ phase: "checking", busy: true, canInstall: false, error: null, managerAvailable: manager !== undefined });
    const controller = new AbortController();
    checkAbort = controller;
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const [release, bundle] = await Promise.all([
        bounded((async () => {
          const response = await (options.fetchLatest ?? fetch)(SKIN_LATEST_URL, {
            credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", cache: "no-store",
            headers: { accept: "application/json" }, signal: controller.signal,
          });
          if (!response.ok) throw new Error("Metadata request failed");
          return object(await response.json());
        })()),
        manager === undefined ? Promise.resolve(null) : readBundle(manager),
      ]);
      if (disposed) return;
      if (release?.name !== SKIN_PACKAGE || typeof release.version !== "string") throw new Error("Invalid release metadata");
      versionParts(release.version);
      if (disposed) return;
      publish({ installedVersion: bundle?.version ?? null, latestVersion: release.version });
      if (uncertain !== null) {
        if (bundle?.installable && bundle.version === uncertain.target.version) {
          uncertain = null;
          publish({ phase: "restart-required", busy: false, canInstall: false, error: null });
          return;
        }
        // waitForInstall(null) means no active request at that instant, not a
        // durable terminal receipt. An unchanged inventory cannot rule out an
        // original RPC arriving late, so it never unlocks another mutation.
        publish({ phase: "unknown", busy: false, canInstall: false, error: UNKNOWN });
        return;
      }
      const available = compareSkinVersions(release.version, newest(bundle)) > 0;
      const installable = available && manager !== undefined && bundle?.installable === true;
      if (installable) target = Object.freeze({ version: release.version, spec: `${SKIN_PACKAGE}@${release.version}`, before: bundle! });
      publish({
        phase: available ? "available" : bundle !== null && compareSkinVersions(bundle.version, options.loadedVersion) > 0 ? "restart-required" : "current",
        targetVersion: available ? release.version : null, spec: available ? `${SKIN_PACKAGE}@${release.version}` : null,
        canInstall: installable, busy: false,
        error: manager === undefined ? MANAGER_MISSING : available && !installable ? "未能确认当前皮肤可更新，请在插件管理器核对安装状态。" : null,
      });
    } catch {
      publish({ phase: uncertain === null ? "failed" : "unknown", busy: false, canInstall: false,
        error: uncertain === null ? "检查更新失败，请稍后重试。" : UNKNOWN });
    } finally {
      clearTimeout(timer);
      if (checkAbort === controller) checkAbort = null;
      busy = false;
    }
  };

  const install = async () => {
    if (disposed || busy || uncertain !== null || target === null || !snapshot.canInstall) return;
    busy = true;
    const checked = target;
    target = null;
    const manager = getManager();
    publish({ phase: "installing", busy: true, canInstall: false, error: null, managerAvailable: manager !== undefined });
    let dispatched = false;
    try {
      if (manager === undefined) { publish({ phase: "failed", busy: false, error: MANAGER_MISSING }); return; }
      const before = await readBundle(manager);
      if (disposed) return;
      if (before === null || !before.installable || before.identity !== checked.before.identity) {
        publish({ phase: "failed", busy: false, installedVersion: before?.version ?? null, error: "皮肤安装状态已变化，请重新检查更新。" });
        return;
      }
      if (compareSkinVersions(checked.version, newest(before)) <= 0) {
        publish({ phase: "current", busy: false, installedVersion: before.version, targetVersion: null, spec: null });
        return;
      }
      const requestId = crypto.randomUUID();
      let outcome: unknown;
      dispatched = true;
      try {
        outcome = unwrap(await manager.installBundle(checked.spec, { enabled: before.enabled, requestId }));
      } catch {
        if (disposed) return;
        // Read recovery once, using the same id. Never repeat installBundle.
        if (typeof manager.waitForInstall !== "function") { markUnknown(checked); return; }
        try {
          outcome = unwrap(await bounded(manager.waitForInstall(requestId)));
          if (outcome === null) { markUnknown(checked); return; }
        } catch { markUnknown(checked); return; }
      }
      if (disposed) return;
      const result = object(outcome);
      const application = result?.application;
      if (typeof result?.changed !== "boolean" || !["install", "enable"].includes(String(result.stage))
        || (result.target !== SKIN_PACKAGE && result.target !== checked.spec)
        || !["applied", "restart-required", "overridden", "failed", "cancelled"].includes(String(application))) {
        markUnknown(checked); return;
      }
      if (application === "failed") {
        publish({ phase: "failed", busy: false, error: refusal(object(result.error)?.code) });
        return;
      }
      if (application === "cancelled") {
        publish({ phase: "cancelled", busy: false, error: "更新已取消。" });
        return;
      }
      if (result.bundle !== SKIN_PACKAGE || (result.version !== undefined && result.version !== checked.version)) {
        markUnknown(checked); return;
      }
      let installed: Bundle | null;
      try { installed = await readBundle(manager); } catch { markUnknown(checked); return; }
      if (disposed) return;
      if (installed?.version !== checked.version) { markUnknown(checked); return; }
      publish({ phase: application as SkinUpdatePhase, busy: false, installedVersion: installed.version, canInstall: false,
        error: application === "overridden" ? "更新包已安装，但启用状态被其他配置覆盖，请在插件管理器核对。" : null });
    } catch {
      if (dispatched) markUnknown(checked);
      else publish({ phase: "failed", busy: false, canInstall: false, error: "无法核对当前安装状态，请重新检查更新。" });
    } finally { busy = false; }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    check, install,
    dispose() {
      if (disposed) return;
      disposed = true;
      checkAbort?.abort();
      listeners.clear();
    },
  };
}
