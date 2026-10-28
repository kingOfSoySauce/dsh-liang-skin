import { afterEach, describe, expect, it, vi } from "vitest";
import { compareSkinVersions, createSkinUpdater, SKIN_LATEST_URL, SKIN_PACKAGE, type PluginManagerLike } from "./updater";

const ok = (value: unknown) => ({ ok: true, value });
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

function fixture(options: { loaded?: string; installed?: string; latest?: string; enabled?: boolean } = {}) {
  const bundle = {
    name: SKIN_PACKAGE, version: options.installed ?? "0.1.12", enabled: options.enabled ?? true,
    installed: true, optional: false, removable: true,
    rows: [{ rowId: "liang-intensity-skin", moduleName: SKIN_PACKAGE }], overrides: [],
    // Newer Desktop exposes this; old Web inventories legitimately omit it.
    source: `${SKIN_PACKAGE}@${options.installed ?? "0.1.12"}`,
  };
  const result = (application = "restart-required") => ok({
    changed: true, application, stage: "enable", target: SKIN_PACKAGE, bundle: SKIN_PACKAGE,
  });
  const listBundles = vi.fn(async () => ok([bundle]));
  const installBundle = vi.fn(async (spec: string, _options: { enabled: boolean; requestId: string }) => {
    bundle.version = spec.slice(spec.lastIndexOf("@") + 1);
    return result();
  });
  const waitForInstall = vi.fn(async (): Promise<unknown> => null);
  const manager: PluginManagerLike = { listBundles, installBundle, waitForInstall };
  const fetchLatest = vi.fn(async () => new Response(JSON.stringify({
    name: SKIN_PACKAGE, version: options.latest ?? "0.1.13",
  }), { status: 200 }));
  const store = createSkinUpdater({ loadedVersion: options.loaded ?? "0.1.12", manager, fetchLatest });
  return { bundle, result, listBundles, installBundle, waitForInstall, manager, fetchLatest, store };
}

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("strict skin version precedence", () => {
  it.each([
    ["0.1.15-settings.1", "0.1.14", 1],
    ["0.1.15-settings.1", "0.1.15", -1],
    ["0.1.15-rc.10", "0.1.15-rc.2", 1],
    ["0.1.15-1", "0.1.15-alpha", -1],
    ["0.1.15-alpha", "0.1.15-alpha.1", -1],
    ["0.1.15+one", "0.1.15+two", 0],
  ])("compares %s against %s", (left, right, expected) => {
    expect(compareSkinVersions(left, right)).toBe(expected);
  });

  it.each(["latest", "v0.1.15", "0.01.15", "0.1.15-01", "0.1.15.", "0.1.15+", "0.1"])("rejects %s", value => {
    expect(() => compareSkinVersions(value, "0.1.15")).toThrow();
  });
});

describe("skin self updater", () => {
  it("does nothing until asked and uses a credential-free fixed metadata request", async () => {
    const env = fixture();
    expect(env.store.getSnapshot().phase).toBe("idle");
    expect(env.fetchLatest).not.toHaveBeenCalled();
    expect(env.listBundles).not.toHaveBeenCalled();
    expect(env.installBundle).not.toHaveBeenCalled();
    await env.store.check();
    expect(env.fetchLatest).toHaveBeenCalledWith(SKIN_LATEST_URL, expect.objectContaining({
      credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", signal: expect.any(AbortSignal),
    }));
    expect(env.store.getSnapshot()).toMatchObject({
      phase: "available", installedVersion: "0.1.12", loadedVersion: "0.1.12", latestVersion: "0.1.13",
      targetVersion: "0.1.13", spec: `${SKIN_PACKAGE}@0.1.13`, canInstall: true, busy: false,
    });
    expect(env.installBundle).not.toHaveBeenCalled();
    env.store.dispose();
  });

  it.each([
    { loaded: "0.1.15-settings.1", installed: "0.1.12", latest: "0.1.14", phase: "current" },
    { loaded: "0.1.12", installed: "0.1.15", latest: "0.1.14", phase: "restart-required" },
  ])("never downgrades past either the loaded or installed version", async options => {
    const env = fixture(options);
    await env.store.check();
    await env.store.install();
    expect(env.store.getSnapshot()).toMatchObject({ phase: options.phase, canInstall: false, spec: null });
    expect(env.installBundle).not.toHaveBeenCalled();
    env.store.dispose();
  });

  it("supports late-loading manager services without making them required at startup", async () => {
    const env = fixture();
    let manager: PluginManagerLike | undefined;
    const store = createSkinUpdater({ loadedVersion: "0.1.12", manager: () => manager, fetchLatest: env.fetchLatest });
    await store.check();
    expect(store.getSnapshot()).toMatchObject({ phase: "available", managerAvailable: false, canInstall: false });
    manager = env.manager;
    await store.check();
    expect(store.getSnapshot()).toMatchObject({ managerAvailable: true, canInstall: true });
    store.dispose(); env.store.dispose();
  });

  it("installs the frozen exact version and preserves disabled bundle selection", async () => {
    const env = fixture({ enabled: false });
    await env.store.check();
    env.fetchLatest.mockImplementation(async () => new Response(JSON.stringify({ name: SKIN_PACKAGE, version: "0.1.99" })));
    await Promise.all([env.store.install(), env.store.install()]);
    expect(env.installBundle).toHaveBeenCalledTimes(1);
    expect(env.installBundle).toHaveBeenCalledWith(`${SKIN_PACKAGE}@0.1.13`, {
      enabled: false, requestId: expect.stringMatching(/^[a-f\d-]{36}$/),
    });
    expect(env.fetchLatest).toHaveBeenCalledTimes(1);
    expect(env.bundle.enabled).toBe(false);
    expect(env.store.getSnapshot()).toMatchObject({
      phase: "restart-required", installedVersion: "0.1.13", loadedVersion: "0.1.12", canInstall: false,
    });
    env.store.dispose();
  });

  it.each(["applied", "overridden", "cancelled"])("keeps the host's %s outcome distinct", async application => {
    const env = fixture();
    env.installBundle.mockImplementation(async () => {
      if (application !== "cancelled") env.bundle.version = "0.1.13";
      return env.result(application);
    });
    await env.store.check(); await env.store.install();
    expect(env.store.getSnapshot().phase).toBe(application);
    expect(env.store.getSnapshot().loadedVersion).toBe("0.1.12");
    env.store.dispose();
  });

  it("preserves Desktop already-installed refusal without leaking arbitrary package output", async () => {
    const env = fixture();
    env.installBundle.mockImplementation(async () => ok({
      changed: false, application: "failed", stage: "install", target: `${SKIN_PACKAGE}@0.1.13`,
      error: { code: "already-installed", diagnostic: "arbitrary host diagnostic" },
      packageResult: { output: "unfiltered package output" },
    }));
    await env.store.check(); await env.store.install();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "failed", installedVersion: "0.1.12", canInstall: false });
    expect(env.store.getSnapshot().error).toContain("皮肤市场");
    expect(JSON.stringify(env.store.getSnapshot())).not.toContain("arbitrary host diagnostic");
    expect(JSON.stringify(env.store.getSnapshot())).not.toContain("unfiltered package output");
    expect(env.waitForInstall).not.toHaveBeenCalled();
    env.store.dispose();
  });

  it.each(["enabled", "source", "version"])("refuses stale updates when %s changes after checking", async field => {
    const env = fixture();
    await env.store.check();
    if (field === "enabled") env.bundle.enabled = false;
    else if (field === "source") env.bundle.source = "link:/different-checkout";
    else env.bundle.version = "0.1.14";
    await env.store.install();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "failed", canInstall: false });
    expect(env.installBundle).not.toHaveBeenCalled();
    env.store.dispose();
  });

  it("locks unknown results and never repeats a mutation to recover a lost receipt", async () => {
    const env = fixture();
    env.installBundle.mockRejectedValue(new Error("transport disconnected"));
    env.waitForInstall.mockResolvedValue(ok(null));
    await env.store.check(); await env.store.install();
    const requestId = env.installBundle.mock.calls[0][1].requestId;
    expect(env.waitForInstall).toHaveBeenCalledExactlyOnceWith(requestId);
    expect(env.store.getSnapshot()).toMatchObject({ phase: "unknown", canInstall: false });
    await env.store.install(); await env.store.install();
    expect(env.installBundle).toHaveBeenCalledTimes(1);
    // A null recovery is not a durable receipt. Even a fresh, unchanged
    // inventory cannot rule out the original RPC arriving later.
    await env.store.check();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "unknown", canInstall: false });
    await env.store.install();
    expect(env.installBundle).toHaveBeenCalledTimes(1);
    expect(env.waitForInstall).toHaveBeenCalledTimes(1);
    env.store.dispose();
  });

  it("does not unlock an unresolved transport failure just because the old version is still listed", async () => {
    const env = fixture();
    env.installBundle.mockRejectedValue(new Error("disconnected"));
    env.waitForInstall.mockRejectedValue(new Error("still disconnected"));
    await env.store.check(); await env.store.install(); await env.store.check(); await env.store.install();
    expect(env.store.getSnapshot().phase).toBe("unknown");
    expect(env.installBundle).toHaveBeenCalledTimes(1);
    expect(env.waitForInstall).toHaveBeenCalledTimes(1);
    env.bundle.version = "0.1.13";
    await env.store.check();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "restart-required", installedVersion: "0.1.13", loadedVersion: "0.1.12" });
    env.store.dispose();
  });

  it("accepts one recovered host result and verifies the actual installed version", async () => {
    const env = fixture();
    env.installBundle.mockImplementation(async () => { env.bundle.version = "0.1.13"; throw new Error("reply lost"); });
    env.waitForInstall.mockResolvedValue(env.result("applied"));
    await env.store.check(); await env.store.install();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "applied", installedVersion: "0.1.13", loadedVersion: "0.1.12" });
    expect(env.installBundle).toHaveBeenCalledTimes(1);
    env.store.dispose();
  });

  it("does not report success from a malformed receipt or an unmaterialized version", async () => {
    const env = fixture();
    env.installBundle.mockResolvedValue(env.result("applied"));
    await env.store.check(); await env.store.install();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "unknown", installedVersion: "0.1.12", canInstall: false });
    env.store.dispose();
    const other = fixture();
    other.installBundle.mockResolvedValue(ok({ application: "applied" }));
    await other.store.check(); await other.store.install();
    expect(other.store.getSnapshot().phase).toBe("unknown");
    other.store.dispose();
  });

  it.each([
    { name: "another-package", version: "0.1.99" },
    { name: SKIN_PACKAGE, version: "latest" },
    { name: SKIN_PACKAGE, version: "0.1.15-01" },
  ])("rejects mismatched or invalid release metadata", async metadata => {
    const env = fixture();
    env.fetchLatest.mockResolvedValue(new Response(JSON.stringify(metadata)));
    await env.store.check(); await env.store.install();
    expect(env.store.getSnapshot()).toMatchObject({ phase: "failed", canInstall: false });
    expect(env.installBundle).not.toHaveBeenCalled();
    env.store.dispose();
  });

  it("bounds metadata reads and prevents concurrent checks", async () => {
    vi.useFakeTimers();
    const env = fixture();
    env.fetchLatest.mockImplementation(() => new Promise(() => {}));
    const checking = env.store.check();
    await env.store.check();
    expect(env.fetchLatest).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10_000);
    await checking;
    expect(env.store.getSnapshot()).toMatchObject({ phase: "failed", busy: false });
    env.store.dispose();
  });

  it("stops notifications on disposal without retrying or cancelling an issued host operation", async () => {
    const env = fixture();
    const operation = deferred<unknown>();
    env.installBundle.mockImplementation(() => operation.promise);
    await env.store.check();
    const listener = vi.fn(); env.store.subscribe(listener);
    const installing = env.store.install();
    await vi.waitFor(() => expect(env.installBundle).toHaveBeenCalledTimes(1));
    env.store.dispose();
    const count = listener.mock.calls.length;
    env.bundle.version = "0.1.13";
    operation.resolve(env.result());
    await installing;
    await env.store.install(); await env.store.check();
    expect(listener).toHaveBeenCalledTimes(count);
    expect(env.installBundle).toHaveBeenCalledTimes(1);
    expect(env.waitForInstall).not.toHaveBeenCalled();
  });
});
