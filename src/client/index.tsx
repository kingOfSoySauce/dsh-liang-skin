import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Context as ClientContext } from "@deepseek-ai/cordis";
import type { SnapshotStore } from "@deepseek-ai/dsh-client-store";
import type {} from "@deepseek-ai/dsh-client-ui-conversation/client";
import type {} from "@deepseek-ai/dsh-client-ui-settings/client";
import type {} from "@deepseek-ai/dsh-client-ui-model-selection/client";
import type {} from "@deepseek-ai/dsh-client-ui-plugin-manager/client";
import styles from "./skin.css";
import optionalVisuals from "./optional-visuals.css";
import { createAmbient, type AmbientHandle } from "./ambient";
import { createPortraitMotion, type PortraitMotionHandle } from "./motion";
import { createPreferenceStore, type PreferenceStore } from "./preferences";
import { SettingsPanel, SETTINGS_LOCALES, settingsStyles, type SettingsPanelProps } from "./settings-panel";
import { createEffortSync } from "./effort-sync";
import { createSkinUpdater, type PluginManagerLike } from "./updater";
import { UPDATE_LOCALES, updateStyles } from "./update-controls";

declare const __LIANG_VERSION__: string;
import { createPortraitLoader } from "./portrait-loader";
import {
  PREVIEW_MAX_FRAME,
  MAX_LEVEL,
  TEAM_NODE_ID,
  frameForLevel,
  snapFrame,
  frameForEffort,
  committedSliderIndex,
  hasTeamNode,
  indicatorLabel,
  nearestEffortIndex,
  paletteForFrame,
  selectedEffortIndex,
  sliderNodes,
  type EffortLike,
} from "./logic";

const PACKAGE_ID = "dsh-client-liang-intensity-skin";
const LOCALE_NAMESPACE = "liang.skin";
const ASSET_PREFIX = `/plugins/${PACKAGE_ID}/assets`;
const BUNDLE_PACKAGE_ID = "@leon___/dsh-client-liang-intensity-skin";
const TEAM_LOCALES = {
  zh: { "slider.team": "智能体团队" },
  en: { "slider.team": "agent teamwork" },
} as const;
const CONVERSATION_COLUMN_SELECTORS = [
  "[data-pane=\"conversation\"]",
  "[class*=\"centerCol\"]",
];

function findConversationColumn(): HTMLElement | null {
  for (const selector of CONVERSATION_COLUMN_SELECTORS) {
    const column = document.querySelector<HTMLElement>(selector);
    if (column !== null) return column;
  }
  return null;
}

const PORTRAIT_ANCHORS = [
  { level: 0, file: "stage-00.webp" },
  { level: 1, file: "level-01.webp" },
  { level: 3, file: "level-03.webp" },
  { level: 4, file: "level-04.webp" },
  { level: 6, file: "stage-06.webp" },
  { level: 7, file: "level-07.webp" },
  { level: 9, file: "level-09.webp" },
  { level: 10, file: "level-10.webp" },
  { level: 12, file: "stage-12.webp" },
  { level: 13, file: "level-13.webp" },
  { level: 14, file: "level-14.webp" },
  { level: 15, file: "bridge-15.webp" },
  { level: 16, file: "level-16.webp" },
  { level: 17, file: "level-17.webp" },
  { level: 18, file: "stage-18.webp" },
  { level: 19, file: "level-19.webp" },
  { level: 21, file: "level-21.webp" },
  { level: 22, file: "level-22.webp" },
  { level: 24, file: "stage-24.webp" },
  { level: 25, file: "level-25.webp" },
  { level: 27, file: "bridge-27.webp" },
  { level: 28, file: "level-28.webp" },
  { level: 29, file: "level-29.webp" },
  { level: 30, file: "stage-30.webp" },
] as const;

interface ModelSelection {
  provider: string;
  model: string;
  reasoningEffort?: string;
}

interface CatalogModel {
  id: string;
  reasoning?: {
    efforts: EffortLike[];
    defaultEffort?: string;
  };
}

interface ModelDirectoryState {
  current: ModelSelection | null;
  groups: readonly { id: string; models: CatalogModel[] }[];
  status: "idle" | "loading" | "ready" | "selecting" | "error";
  error: string | null;
}

interface ModelDirectory {
  store: SnapshotStore<ModelDirectoryState>;
  load(): Promise<unknown>;
  select(selection: ModelSelection): Promise<{ ok: boolean }>;
}

interface AgentTeamsRemote {
  setEnabled(agentId: string, enabled: boolean): Promise<{ ok: boolean }>;
}

interface AgentTeamProjection {
  enabled?: boolean;
}

interface SliderProps {
  directory: SnapshotStore<ModelDirectoryState>;
  load: () => void;
  select: (selection: ModelSelection) => Promise<boolean>;
  setTeamEnabled: (enabled: boolean) => Promise<boolean>;
  teamSupported: () => boolean;
  t: (key: string) => string;
  presenter: SkinPresenter;
  scope: PreferenceStore;
  available: boolean;
  session?: SessionLike;
  useProjection?: (key: string) => unknown;
}

interface SessionLike {
  subscribe(listener: () => void): () => void;
  getSnapshot(): { running?: boolean } | null;
}

const cssVariables = [
  "--liang-strength",
  "--liang-page",
  "--liang-bg-base",
  "--liang-mask-base",
  "--liang-mask-strong",
  "--liang-mask-soft",
  "--liang-control-rail",
  "--liang-control-border",
  "--liang-control-fill",
  "--liang-layer-1",
  "--liang-layer-2",
  "--liang-layer-3",
  "--liang-sidebar",
  "--liang-ink",
  "--liang-secondary",
  "--liang-tertiary",
  "--liang-border",
  "--liang-accent",
  "--liang-accent-hover",
  "--liang-hover",
  "--liang-portrait-opacity",
] as const;

class SkinPresenter {
  private readonly scope: PreferenceStore;
  private readonly root: HTMLDivElement;
  private portraits: ReturnType<typeof createPortraitLoader>;
  private portraitSet = false;
  private ambient: AmbientHandle | null = null;
  private particleCanvas: HTMLCanvasElement | null = null;
  private motion: PortraitMotionHandle | null = null;
  private running = false;
  private previewing = false;
  private enabled = false;
  // Default to the max frame so the first paint after load is the dark shell;
  // starting at 0 flashed the light palette before the directory resolved.
  private frame = PREVIEW_MAX_FRAME;
  private pendingFrame = PREVIEW_MAX_FRAME;
  private raf = 0;
  private disposed = false;
  private readonly placementObserver: MutationObserver;
  private readonly hostThemeObserver: MutationObserver;
  // The host's effective scheme is mirrored only while the skin is active; the
  // user's native theme preference is never written (see README).
  private hostScheme: { dark: boolean; colorScheme: string } | null = null;
  private unsubscribe: () => void;

  constructor(scope: PreferenceStore) {
    this.scope = scope;
    this.root = document.createElement("div");
    this.root.className = "liang-skin-backdrop";
    this.root.dataset.plugin = PACKAGE_ID;
    this.root.dataset.media = "color";
    this.root.setAttribute("aria-hidden", "true");
    this.placementObserver = new MutationObserver(() => {
      if (this.enabled) this.mountBackdrop();
    });
    this.placementObserver.observe(document.body, { childList: true, subtree: true });
    // Host theme presenters re-apply the palette attribute on theme changes;
    // keep the skin-owned marker authoritative while the skin is enabled.
    this.hostThemeObserver = new MutationObserver(() => {
      this.syncHostScheme();
    });
    this.hostThemeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-ds-dark-theme"],
    });
    this.hostThemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    this.portraits = this.createPortraits(false);

    this.unsubscribe = scope.subscribe(() => this.syncSettings());
    this.syncSettings();
  }

  /**
   * Capture the host-owned scheme once, before the skin starts mirroring its
   * own stage, so disabling or unloading can hand the DOM back untouched.
   */
  private captureHostScheme() {
    if (this.hostScheme !== null) return;
    this.hostScheme = {
      dark: document.body.hasAttribute("data-ds-dark-theme"),
      colorScheme: document.documentElement.style.colorScheme,
    };
  }

  /**
   * Mirror the skin's effective light/dark stage onto the host scheme markers.
   * The host uses `body[data-ds-dark-theme]` to select its static palettes and
   * `html { color-scheme }` for native controls, scrollbars and UA chrome; both
   * must follow the skin palette or half the host surfaces keep the other
   * theme's values (issues #24/#26). The user's saved theme preference is left
   * alone because only the rendered markers are touched.
   */
  private syncHostScheme() {
    if (this.disposed || !this.enabled) return;
    const stage = document.body.dataset.liangStage;
    if (stage === undefined) return;
    this.captureHostScheme();
    const dark = stage === "5";
    document.body.toggleAttribute("data-ds-dark-theme", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  private restoreHostScheme() {
    const saved = this.hostScheme;
    if (saved === null) return;
    this.hostScheme = null;
    document.body.toggleAttribute("data-ds-dark-theme", saved.dark);
    if (saved.colorScheme === "") document.documentElement.style.removeProperty("color-scheme");
    else document.documentElement.style.colorScheme = saved.colorScheme;
  }

  private mountBackdrop() {
    const column = findConversationColumn();
    if (column === null) return false;
    if (this.root.parentElement !== column) column.insertBefore(this.root, column.firstChild);
    return true;
  }

  private createPortraits(xianxia: boolean) {
    this.root.dataset.portraitSet = xianxia ? "xianxia" : "original";
    return createPortraitLoader({
      sources: PORTRAIT_ANCHORS.map(({ level, file }) => ({
        level,
        url: `${ASSET_PREFIX}/${xianxia ? "portrait-source-xianxia-v2" : "portrait-source-v2"}/${file}`,
      })),
      onChange: ({ image }) => {
        if (this.disposed || !this.enabled) return;
        if (image === null) {
          this.root.dataset.media = "color";
          for (const node of this.root.querySelectorAll("img")) node.remove();
          return;
        }
        const portrait = image as HTMLImageElement;
        portrait.className = "liang-skin-sequence-frame";
        portrait.alt = "";
        portrait.draggable = false;
        if (this.root.querySelector("img") !== portrait) {
          for (const node of this.root.querySelectorAll("img")) node.remove();
          this.root.prepend(portrait);
        }
        this.root.dataset.media = "sequence";
        this.syncParticleAnchors();
      },
    });
  }

  private syncSettings() {
    const settings = this.scope.getSnapshot();
    if (this.portraitSet !== settings.xianxiaPortraits) {
      this.portraits.dispose();
      for (const node of this.root.querySelectorAll("img")) node.remove();
      this.root.dataset.media = "color";
      this.portraitSet = settings.xianxiaPortraits;
      this.portraits = this.createPortraits(this.portraitSet);
      this.portraits.select(paletteForFrame(this.frame).level);
      if (this.enabled && settings.enabled) this.portraits.start();
    }
    this.setMaskEnabled(settings.maskEnabled);
    this.setEnabled(settings.enabled);
    this.syncOptionalEffects();
    // The opaque-panels choice is a palette input, not a CSS class: repaint the
    // current frame so the switch takes effect immediately.
    if (this.enabled) this.applyFrame();
  }

  private syncOptionalEffects() {
    const settings = this.scope.getSnapshot();
    if (this.enabled && settings.motionEnabled) {
      this.motion ??= createPortraitMotion(this.root);
      this.motion.setRunning(this.running);
      this.motion.setPreviewing(this.previewing);
    } else {
      this.motion?.dispose();
      this.motion = null;
    }
    if (this.enabled && settings.particlesEnabled) {
      if (this.ambient === null) {
        this.particleCanvas = document.createElement("canvas");
        this.particleCanvas.className = "liang-ambient";
        this.particleCanvas.setAttribute("aria-hidden", "true");
        this.root.append(this.particleCanvas);
        this.ambient = createAmbient(this.particleCanvas);
        window.addEventListener("resize", this.syncParticleAnchors);
        const palette = paletteForFrame(this.frame);
        this.ambient.setLevel(palette.level, palette.stage === 5);
        this.syncParticleAnchors();
        this.ambient.start();
      }
    } else {
      this.ambient?.dispose();
      this.ambient = null;
      this.particleCanvas?.remove();
      this.particleCanvas = null;
      window.removeEventListener("resize", this.syncParticleAnchors);
    }
  }

  private readonly syncParticleAnchors = () => {
    if (this.ambient === null) return;
    const bounds = this.root.getBoundingClientRect();
    const input = this.root.parentElement?.querySelector(".liang-effort-control")?.getBoundingClientRect();
    const image = this.root.querySelector("img")?.getBoundingClientRect();
    this.ambient.setAnchor(input?.right ?? bounds.left + bounds.width * 0.6, input ? input.top + input.height / 2 : bounds.top + bounds.height * 0.7);
    this.ambient.setTarget(image ? image.left + image.width * 0.55 : bounds.right - bounds.width * 0.18, image ? image.top + image.height * 0.3 : bounds.top + bounds.height * 0.3);
  };

  setRunning(running: boolean) {
    this.running = running;
    this.motion?.setRunning(running);
  }

  setPreviewing(previewing: boolean) {
    this.previewing = previewing;
    this.motion?.setPreviewing(previewing);
  }

  isEnabled() {
    return this.enabled;
  }

  getFrame() {
    return this.frame;
  }

  setEnabled(enabled: boolean) {
    if (this.disposed || this.enabled === enabled) return;
    this.enabled = enabled;
    if (enabled) {
      this.mountBackdrop();
      document.body.dataset.liangSkin = "on";
      this.applyFrame();
      this.portraits.start();
    } else {
      if (this.raf !== 0) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.root.remove();
      this.portraits.stop();
      for (const node of this.root.querySelectorAll("img")) node.remove();
      this.root.dataset.media = "color";
      delete document.body.dataset.liangSkin;
      delete document.body.dataset.liangStage;
      for (const name of cssVariables) document.body.style.removeProperty(name);
      this.restoreHostScheme();
    }
    this.syncOptionalEffects();
  }

  setMaskEnabled(enabled: boolean) {
    if (this.disposed) return;
    this.root.dataset.mask = enabled ? "on" : "off";
  }

  setFrame(frame: number) {
    if (this.disposed) return;
    this.pendingFrame = Math.min(PREVIEW_MAX_FRAME, Math.max(0, Math.round(frame)));
    this.frame = this.pendingFrame;
    if (!this.enabled) return;
    if (this.raf !== 0) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.frame = this.pendingFrame;
      this.applyFrame();
    });
  }

  private applyFrame() {
    if (this.disposed || !this.enabled) return;
    const settings = this.scope.getSnapshot();
    const palette = paletteForFrame(this.frame, { solidSurfaces: settings.solidSurfaces });
    const body = document.body;
    body.dataset.liangStage = String(palette.stage);
    body.style.setProperty("--liang-strength", String(palette.strength));
    body.style.setProperty("--liang-page", palette.page);
    body.style.setProperty("--liang-bg-base", palette.base);
    body.style.setProperty("--liang-mask-base", palette.maskBase);
    body.style.setProperty("--liang-mask-strong", palette.maskStrong);
    body.style.setProperty("--liang-mask-soft", palette.maskSoft);
    body.style.setProperty("--liang-control-rail", palette.controlRail);
    body.style.setProperty("--liang-control-border", palette.controlBorder);
    body.style.setProperty("--liang-control-fill", palette.controlFill);
    body.style.setProperty("--liang-layer-1", palette.layer1);
    body.style.setProperty("--liang-layer-2", palette.layer2);
    body.style.setProperty("--liang-layer-3", palette.layer3);
    body.style.setProperty("--liang-sidebar", palette.sidebar);
    body.style.setProperty("--liang-ink", palette.ink);
    body.style.setProperty("--liang-secondary", palette.secondary);
    body.style.setProperty("--liang-tertiary", palette.tertiary);
    body.style.setProperty("--liang-border", palette.border);
    body.style.setProperty("--liang-accent", palette.accent);
    body.style.setProperty("--liang-accent-hover", palette.accentHover);
    body.style.setProperty("--liang-hover", palette.hover);
    body.style.setProperty("--liang-portrait-opacity", palette.portraitOpacity);
    this.syncHostScheme();
    this.updatePortrait(palette.level);
    this.ambient?.setLevel(palette.level, palette.stage === 5);
    this.syncParticleAnchors();
  }

  private updatePortrait(level: number) {
    this.portraits.select(level);
  }

  async choose(enabled: boolean) {
    this.setEnabled(enabled);
    try {
      await this.scope.set(enabled);
    } catch (error) {
      this.syncSettings();
      throw error;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe();
    this.placementObserver.disconnect();
    this.hostThemeObserver.disconnect();
    if (this.raf !== 0) cancelAnimationFrame(this.raf);
    this.portraits.dispose();
    this.motion?.dispose();
    this.ambient?.dispose();
    window.removeEventListener("resize", this.syncParticleAnchors);
    this.particleCanvas?.remove();
    this.motion = null;
    this.ambient = null;
    this.root.remove();
    document.body.removeAttribute("data-liang-skin");
    delete document.body.dataset.liangStage;
    for (const name of cssVariables) document.body.style.removeProperty(name);
    this.restoreHostScheme();
  }
}

function modelReasoning(state: ModelDirectoryState) {
  const current = state.current;
  if (current === null) return null;
  const group = state.groups.find((item) => item.id === current.provider);
  const model = group?.models.find((item) => item.id === current.model);
  if (model?.reasoning === undefined) return null;
  return {
    selection: current,
    efforts: model.reasoning.efforts,
    defaultEffort: model.reasoning.defaultEffort,
  };
}

function useSessionRunning(session: SessionLike | undefined) {
  return useSyncExternalStore(
    (listener) => session?.subscribe(listener) ?? (() => {}),
    () => session?.getSnapshot()?.running === true,
  );
}

function LiangEffortSlider({
  directory,
  load,
  select,
  setTeamEnabled,
  teamSupported,
  t,
  presenter,
  scope,
  available,
  session,
  useProjection,
}: SliderProps) {
  const state = useSyncExternalStore(
    (listener) => directory.subscribe(listener),
    () => directory.getSnapshot(),
  );
  const skin = useSyncExternalStore(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot(),
  );
  const runtimeTeam = useProjection?.("agentTeam") as AgentTeamProjection | undefined;
  const reasoning = useMemo(() => modelReasoning(state), [state]);
  const efforts = reasoning?.efforts ?? [];
  const bindEffort = skin.bindEffort;
  const teamEnabled = runtimeTeam?.enabled === true;
  // The extra stop exists only while this client can save Team mode and the
  // session publishes its saved Team selection; otherwise the slider is
  // exactly the effort ladder it has always been.
  const teamStop = bindEffort && skin.teamNode
    && teamSupported()
    && runtimeTeam !== undefined && typeof runtimeTeam.enabled === "boolean"
    && efforts.length >= 2
    ? `${efforts[efforts.length - 1].name} ${t("slider.team")}`
    : null;
  const nodes = sliderNodes(efforts, teamStop);
  const teamNode = hasTeamNode(nodes);
  const committedIndex = selectedEffortIndex(
    efforts,
    reasoning?.selection.reasoningEffort,
    reasoning?.defaultEffort,
  );
  const teamActive = teamNode && teamEnabled && committedIndex === efforts.length - 1;
  const committedNodeIndex = committedSliderIndex(committedIndex, nodes.length, teamActive);
  // An unknown committed effort defaults to the max frame: a fresh
  // conversation paints the dark shell immediately instead of flashing the
  // light palette until the directory load resolves the real effort.
  const effortFrame = committedNodeIndex < 0
    ? PREVIEW_MAX_FRAME
    : frameForEffort(committedNodeIndex, nodes.length);
  const fine = bindEffort && skin.fineStopsEnabled;
  const committedFrame = fine ? snapFrame(effortFrame) : effortFrame;
  const modelKey = JSON.stringify([reasoning?.selection.provider, reasoning?.selection.model, efforts.map((effort) => effort.id)]);
  const selectionKey = JSON.stringify([modelKey, teamActive ? TEAM_NODE_ID : efforts[committedIndex]?.id ?? null]);
  const modeKey = JSON.stringify([modelKey, bindEffort, fine, teamNode]);
  const sync = useRef(createEffortSync());
  const latest = useRef({ modelKey, committedFrame });
  latest.current = { modelKey, committedFrame };
  const running = useSessionRunning(session);
  const [frame, setFrame] = useState(() => bindEffort ? committedFrame : presenter.getFrame());
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const dragging = useRef(false);
  const dragStartFrame = useRef(frame);
  const dragStartSelection = useRef(selectionKey);
  const enabled = skin.enabled && available;

  const cancelInteraction = useCallback(() => {
    setInteracting(false);
    presenter.setPreviewing(false);
    dragging.current = false;
    const externalChange = bindEffort && dragStartSelection.current !== selectionKey;
    if (externalChange) {
      sync.current.reset();
      sync.current.observe({ key: selectionKey, mode: modeKey, frame: committedFrame, fine });
    }
    const restored = externalChange ? committedFrame : dragStartFrame.current;
    setFrame(restored);
    presenter.setFrame(restored);
  }, [bindEffort, selectionKey, modeKey, committedFrame, fine, presenter]);

  useEffect(() => {
    if (!skin.hideSlider) return;
    if (dragging.current) cancelInteraction();
    else {
      setInteracting(false);
      presenter.setPreviewing(false);
    }
    // Hiding never cancels a submitted model selection or its acknowledgement.
  }, [skin.hideSlider, cancelInteraction, presenter]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  useEffect(() => {
    if (!available) return;
    presenter.setRunning(running);
    return () => presenter.setRunning(false);
  }, [presenter, running, available]);

  useEffect(() => available ? () => presenter.setPreviewing(false) : undefined, [presenter, available]);

  useEffect(() => {
    if (!enabled || !bindEffort || dragging.current || pending || state.status === "selecting") return;
    const next = sync.current.observe({ key: selectionKey, mode: modeKey, frame: committedFrame, fine });
    if (next === null) return;
    setFrame(next);
    presenter.setFrame(next);
  }, [enabled, bindEffort, committedFrame, selectionKey, modeKey, fine, pending, presenter, state.status]);

  if (!enabled || skin.hideSlider) return null;
  if (bindEffort && (reasoning === null || efforts.length < 2)) return null;

  const previewIndex = nearestEffortIndex(frame, nodes);
  const previewNode = nodes[previewIndex];
  const progressRatio = frame / PREVIEW_MAX_FRAME;
  const tooltipLabel = indicatorLabel(frame, bindEffort ? nodes : [], { withLevel: fine });

  const commit = async (rawFrame: number) => {
    if (!bindEffort) {
      dragging.current = false;
      setFrame(rawFrame);
      presenter.setFrame(rawFrame);
      return;
    }
    const fineFrame = fine ? snapFrame(rawFrame) : rawFrame;
    const targetIndex = nearestEffortIndex(fineFrame, nodes);
    const target = nodes[targetIndex];
    if (target === undefined) return;
    const targetIsTeam = teamNode && targetIndex === nodes.length - 1;
    const targetEffortIndex = targetIsTeam ? efforts.length - 1 : targetIndex;
    const targetEffort = efforts[targetEffortIndex];
    if (targetEffort === undefined) return;
    const targetFrame = targetIsTeam
      ? PREVIEW_MAX_FRAME
      : fine ? fineFrame : frameForEffort(targetEffortIndex, nodes.length);
    dragging.current = false;
    setFrame(targetFrame);
    presenter.setFrame(targetFrame);
    const effortChanged = targetEffortIndex !== committedIndex;
    // The Team switch follows the slider: ending on the Team stop turns it on,
    // ending anywhere below turns it off (only while the stop exists).
    const teamChanged = teamNode && targetIsTeam !== teamEnabled;
    if ((!effortChanged && !teamChanged) || pending) return;
    if (fine) sync.current.submit(JSON.stringify([modelKey, targetIsTeam ? TEAM_NODE_ID : targetEffort.id]), selectionKey, modeKey);
    setPending(true);
    setFailed(false);
    let accepted = true;
    if (effortChanged) {
      accepted = await select({
        provider: reasoning.selection.provider,
        model: reasoning.selection.model,
        reasoningEffort: targetEffort.id,
      });
    }
    if (accepted && teamChanged) accepted = await setTeamEnabled(targetIsTeam);
    setPending(false);
    if (!accepted) {
      sync.current.reset();
      setFailed(true);
      setFrame(latest.current.committedFrame);
      presenter.setFrame(latest.current.committedFrame);
    }
  };

  return (
    <div
      className="liang-effort-control"
      data-plugin={PACKAGE_ID}
      data-state={failed ? "error" : pending ? "pending" : "ready"}
      title={bindEffort ? previewNode?.name : undefined}
    >
      {interacting && (
        <output
          className="liang-effort-control__tooltip"
          style={{ "--liang-slider-ratio": progressRatio } as React.CSSProperties}
        >
          {tooltipLabel}
        </output>
      )}
      <div className="liang-effort-control__ticks" aria-hidden="true">
        {fine && Array.from({ length: MAX_LEVEL + 1 }, (_, level) => (
          <i className="liang-effort-control__tick liang-effort-control__tick--minor" key={`fine-${level}`}
            style={{ left: `${(frameForLevel(level) / PREVIEW_MAX_FRAME) * 100}%` }} />
        ))}
        {nodes.map((node, index) => (
          <i
            className="liang-effort-control__tick"
            key={node.id}
            style={{ left: `${(frameForEffort(index, nodes.length) / PREVIEW_MAX_FRAME) * 100}%` }}
          />
        ))}
      </div>
      <input
        className="liang-effort-control__range"
        type="range"
        min={0}
        max={PREVIEW_MAX_FRAME}
        step={fine ? PREVIEW_MAX_FRAME / MAX_LEVEL : 1}
        value={frame}
        disabled={pending || state.status === "selecting"}
        aria-label={bindEffort ? "思考等级" : "皮肤进度"}
        aria-valuetext={bindEffort ? previewNode?.name ?? "" : tooltipLabel}
        onPointerDown={() => {
          dragging.current = true;
          dragStartFrame.current = frame;
          dragStartSelection.current = selectionKey;
          setInteracting(true);
          presenter.setPreviewing(true);
        }}
        onInput={(event) => {
          dragging.current = true;
          const next = Number(event.currentTarget.value);
          setFrame(next);
          presenter.setFrame(next);
        }}
        onPointerUp={(event) => {
          setInteracting(false);
          presenter.setPreviewing(false);
          void commit(Number(event.currentTarget.value));
        }}
        onPointerCancel={cancelInteraction}
        onKeyUp={(event) => {
          setInteracting(false);
          presenter.setPreviewing(false);
          if (event.key !== "Escape") void commit(Number(event.currentTarget.value));
        }}
        onBlur={(event) => {
          setInteracting(false);
          presenter.setPreviewing(false);
          if (dragging.current) void commit(Number(event.currentTarget.value));
        }}
        onKeyDown={(event) => {
          if (!dragging.current) {
            dragStartFrame.current = frame;
            dragStartSelection.current = selectionKey;
          }
          setInteracting(true);
          presenter.setPreviewing(true);
          if (event.key === "Escape" && !pending) {
            event.preventDefault();
            cancelInteraction();
          }
        }}
      />
    </div>
  );
}

function LiangSettingsPage(props: SettingsPanelProps) {
  return (
    <section className="liang-settings-page">
      <h2 className="liang-settings-page__title">{props.t("settings.title")}</h2>
      <SettingsPanel {...props} />
    </section>
  );
}

export const inject = [
  "slots",
  "sessions",
  "modelDirectories",
  "locale",
];

export function apply(ctx: ClientContext) {
  const style = document.createElement("style");
  style.dataset.plugin = PACKAGE_ID;
  style.textContent = [styles, optionalVisuals, settingsStyles, updateStyles].join("\n");
  document.head.append(style);
  ctx.effect(() => () => style.remove(), "liang-intensity-skin: scoped styles");

  const scope = createPreferenceStore();
  ctx.effect(() => () => scope.dispose(), "liang-intensity-skin: appearance preference");
  const updater = createSkinUpdater({
    loadedVersion: __LIANG_VERSION__,
    manager: () => {
      try {
        return (ctx.get("remote") as { pluginManager?: PluginManagerLike } | undefined)?.pluginManager;
      } catch { return undefined; }
    },
  });
  ctx.effect(() => () => updater.dispose(), "liang-intensity-skin: update state");
  const presenter = new SkinPresenter(scope);
  ctx.effect(() => () => presenter.dispose(), "liang-intensity-skin: backdrop presenter");
  ctx.effect(
    () => ctx.locale.register(LOCALE_NAMESPACE, {
      zh: { ...SETTINGS_LOCALES.zh, ...UPDATE_LOCALES.zh, ...TEAM_LOCALES.zh },
      en: { ...SETTINGS_LOCALES.en, ...UPDATE_LOCALES.en, ...TEAM_LOCALES.en },
    }),
    "liang-intensity-skin: settings locale",
  );

  // Agent Teams is the client's own optional capability: resolve it lazily so
  // a client without the Remote namespace keeps the original slider. `get`
  // reads the service store without declaring an inject requirement.
  const resolveAgentTeams = () => {
    try {
      return (ctx.get as (name: string) => unknown)("remote.agentTeams") as AgentTeamsRemote | undefined;
    } catch { return undefined; }
  };
  const teamSupported = () => typeof resolveAgentTeams()?.setEnabled === "function";

  // The official Plugins page owns this slot. inject waits for it without
  // making plugin-page services mandatory for the skin on older hosts.
  ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
    name: "plugins.bundle.config",
    key: BUNDLE_PACKAGE_ID,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope, updater, teamAvailable: teamSupported }),
  }, SettingsPanel));

  const settingsTitle = ctx.locale.bind(LOCALE_NAMESPACE);
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "liang-skin-settings",
    order: 46,
    label: () => settingsTitle("settings.title"),
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope, updater, teamAvailable: teamSupported }),
  }, LiangSettingsPage));

  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "liang-intensity-control",
    order: 10,
    inject: (sessionId: string) => {
      const available = ctx.sessions.subagentAddress(sessionId) === undefined;
      const directory = ctx.modelDirectories.directoryFor(sessionId) as ModelDirectory;
      const sessions = ctx.sessions as unknown as {
        scope?: (id: string) => unknown;
        sessionOf?: (scope: unknown) => SessionLike;
      };
      const sessionScope = sessions.scope?.(sessionId);
      const session = sessionScope === undefined ? undefined : sessions.sessionOf?.(sessionScope);
      return {
        available,
        session,
        directory: directory.store,
        presenter,
        scope,
        teamSupported,
        t: (key: string) => settingsTitle(key),
        setTeamEnabled: async (enabled: boolean) => {
          const agentTeams = resolveAgentTeams();
          if (agentTeams === undefined) return false;
          try {
            const result = await agentTeams.setEnabled(sessionId, enabled);
            return result?.ok === true;
          } catch {
            return false;
          }
        },
        load: () => {
          if (available) void directory.load().catch(() => undefined);
        },
        select: (selection: ModelSelection) => available
          ? directory.select(selection).then((result) => result.ok, () => false)
          : Promise.resolve(false),
      };
    },
  }, LiangEffortSlider));
}
