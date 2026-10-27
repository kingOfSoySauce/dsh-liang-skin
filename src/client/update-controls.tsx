import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@deepseek-ai/dsh-client-ui-primitives";
import type { SkinUpdaterStore } from "./updater";
import updateStyles from "./update-controls.css";

export { updateStyles };

export const UPDATE_LOCALES = {
  zh: {
    "update.loadedVersion": "当前运行版本 {version}",
    "update.installedVersion": "已安装版本 {version}，与当前运行版本不同。",
    "update.check": "检查更新",
    "update.verify": "核对更新状态",
    "update.checking": "正在检查…",
    "update.install": "更新到 {version}",
    "update.installing": "正在更新…",
    "update.status.checking": "正在检查更新。",
    "update.status.available": "发现新版本 {version}。",
    "update.status.current": "当前无需更新。",
    "update.status.installing": "正在安装更新，请稍候。",
    "update.status.applied": "已安装更新。",
    "update.status.restart": "已安装更新，请重启 DSH 以加载新版本。",
    "update.status.overridden": "当前皮肤存在其他安装来源，请到皮肤市场核对。",
    "update.status.cancelled": "更新已取消。",
    "update.status.failed": "检查或更新失败，请重新检查。",
    "update.status.unknown": "暂时无法确认更新结果，请先核对更新状态。",
    "update.checkFailed": "检查失败，请稍后重试。",
    "update.market": "可到皮肤市场更新。",
  },
  en: {
    "update.loadedVersion": "Running version {version}",
    "update.installedVersion": "Installed version {version} differs from the running version.",
    "update.check": "Check for updates",
    "update.verify": "Verify update status",
    "update.checking": "Checking…",
    "update.install": "Update to {version}",
    "update.installing": "Updating…",
    "update.status.checking": "Checking for updates.",
    "update.status.available": "Version {version} is available.",
    "update.status.current": "No update is needed.",
    "update.status.installing": "Installing the update. Please wait.",
    "update.status.applied": "The update is installed.",
    "update.status.restart": "The update is installed. Restart DSH to load the new version.",
    "update.status.overridden": "Another installation source overrides this skin. Check it in the skin market.",
    "update.status.cancelled": "The update was cancelled.",
    "update.status.failed": "The check or update failed. Check again to retry.",
    "update.status.unknown": "The update result is unknown. Verify its status before continuing.",
    "update.checkFailed": "Could not check for updates. Please try again later.",
    "update.market": "You can update through the skin market.",
  },
};

export interface UpdateControlsProps {
  updater: SkinUpdaterStore;
  t: (key: string) => string;
}

/** No network work happens on mount; installation always follows its own click. */
export function UpdateControls({ updater, t }: UpdateControlsProps) {
  const snapshot = useSyncExternalStore(
    (listener) => updater.subscribe(listener),
    () => updater.getSnapshot(),
    () => updater.getSnapshot(),
  );
  const [action, setAction] = useState<"check" | "install" | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const inFlight = useRef(false);
  const mustVerify = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const text = (key: string, version: string) => t(key).replace("{version}", version);
  const unknown = verificationRequired || snapshot.phase === "unknown";
  const busy = snapshot.busy || action !== null;
  const installing = snapshot.phase === "installing" || action === "install";
  const checking = snapshot.phase === "checking" || action === "check";
  const canInstall = snapshot.phase === "available" && snapshot.canInstall
    && snapshot.targetVersion !== null && !unknown;

  const run = async (next: "check" | "install") => {
    const current = updater.getSnapshot();
    if (inFlight.current || current.busy || !mounted.current) return;
    if (next === "install" && (mustVerify.current || current.phase !== "available"
      || !current.canInstall || current.targetVersion === null)) return;
    inFlight.current = true;
    setAction(next);
    setCheckFailed(false);
    try {
      if (next === "check") {
        await updater.check();
        const result = updater.getSnapshot();
        if (result.phase !== "unknown" && result.phase !== "failed") {
          mustVerify.current = false;
          if (mounted.current) setVerificationRequired(false);
        }
      } else {
        await updater.install();
      }
    } catch {
      // Store errors normally arrive in its snapshot. An unexpected rejection
      // after installation starts is uncertain, never a successful update.
      if (next === "install") {
        mustVerify.current = true;
        if (mounted.current) setVerificationRequired(true);
      } else if (mounted.current) setCheckFailed(true);
    } finally {
      inFlight.current = false;
      if (mounted.current) setAction(null);
    }
  };

  let message = "";
  let alert = false;
  if (unknown && !busy) {
    message = snapshot.error || t("update.status.unknown");
    alert = true;
  } else if (checkFailed) {
    message = t("update.checkFailed");
    alert = true;
  } else if (checking) message = t("update.status.checking");
  else if (installing) message = t("update.status.installing");
  else if (snapshot.phase === "available") {
    const version = snapshot.targetVersion ?? snapshot.latestVersion;
    if (version !== null) message = text("update.status.available", version);
  } else if (snapshot.phase === "current") message = t("update.status.current");
  else if (snapshot.phase === "applied") message = t("update.status.applied");
  else if (snapshot.phase === "restart-required") message = t("update.status.restart");
  else if (snapshot.phase === "cancelled") message = t("update.status.cancelled");
  else if (snapshot.phase === "failed" || snapshot.phase === "overridden") {
    message = snapshot.error || t(`update.status.${snapshot.phase}`);
    alert = true;
  }
  const marketHint = !busy && (snapshot.phase === "failed" || snapshot.phase === "overridden"
    || !snapshot.managerAvailable && snapshot.phase === "available");

  return (
    <div className="liang-update-controls">
      <div className="liang-update-controls__row">
        <span className="liang-update-controls__version">{text("update.loadedVersion", snapshot.loadedVersion)}</span>
        <div className="liang-update-controls__actions" aria-busy={busy}>
          <Button type="button" disabled={busy} onClick={() => { void run("check"); }}>
            {t(checking ? "update.checking" : unknown ? "update.verify" : "update.check")}
          </Button>
          {(canInstall || installing) && snapshot.targetVersion !== null && (
            <Button type="button" disabled={busy || !canInstall} onClick={() => { void run("install"); }}>
              {installing ? t("update.installing") : text("update.install", snapshot.targetVersion)}
            </Button>
          )}
        </div>
      </div>
      {snapshot.installedVersion !== null && snapshot.installedVersion !== snapshot.loadedVersion && (
        <p className="liang-update-controls__detail">{text("update.installedVersion", snapshot.installedVersion)}</p>
      )}
      {message && (
        <p
          className={`liang-update-controls__message${alert ? " liang-update-controls__error" : ""}`}
          role={alert ? "alert" : "status"}
          aria-live={alert ? "assertive" : "polite"}
          aria-atomic="true"
        >
          {message}
        </p>
      )}
      {marketHint && <p className="liang-update-controls__detail">{t("update.market")}</p>}
    </div>
  );
}
