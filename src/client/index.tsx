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
  frameForLevel,
  snapFrame,
  frameForEffort,
  indicatorLabel,
  nearestEffortIndex,
  paletteForFrame,
  selectedEffortIndex,
  type EffortLike,
} from "./logic";

const PACKAGE_ID = "dsh-client-liang-intensity-skin";
const LOCALE_NAMESPACE = "liang.skin";
const ASSET_PREFIX = `/plugins/${PACKAGE_ID}/assets`;
const BUNDLE_PACKAGE_ID = "@leon___/dsh-client-liang-intensity-skin";
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

interface SliderProps {
  directory: SnapshotStore<ModelDirectoryState>;
  load: () => void;
  select: (selection: ModelSelection) => Promise<boolean>;
  presenter: SkinPresenter;
  scope: PreferenceStore;
  available: boolean;
  session?: SessionLike;
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
    this.portraits = this.createPortraits(false);

    this.unsubscribe = scope.subscribe(() => this.syncSettings());
    this.syncSettings();
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
    const palette = paletteForFrame(this.frame);
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

function LiangEffortSlider({ directory, load, select, presenter, scope, available, session }: SliderProps) {
  const state = useSyncExternalStore(
    (listener) => directory.subscribe(listener),
    () => directory.getSnapshot(),
  );
  const skin = useSyncExternalStore(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot(),
  );
  const reasoning = useMemo(() => modelReasoning(state), [state]);
  const efforts = reasoning?.efforts ?? [];
  const committedIndex = selectedEffortIndex(
    efforts,
    reasoning?.selection.reasoningEffort,
    reasoning?.defaultEffort,
  );
  // An unknown committed effort defaults to the max frame: a fresh
  // conversation paints the dark shell immediately instead of flashing the
  // light palette until the directory load resolves the real effort.
  const effortFrame = committedIndex < 0
    ? PREVIEW_MAX_FRAME
    : frameForEffort(committedIndex, efforts.length);
  const bindEffort = skin.bindEffort;
  const fine = bindEffort && skin.fineStopsEnabled;
  const committedFrame = fine ? snapFrame(effortFrame) : effortFrame;
  const modelKey = JSON.stringify([reasoning?.selection.provider, reasoning?.selection.model, efforts.map((effort) => effort.id)]);
  const selectionKey = JSON.stringify([modelKey, efforts[committedIndex]?.id ?? null]);
  const modeKey = JSON.stringify([modelKey, bindEffort, fine]);
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

  const previewIndex = nearestEffortIndex(frame, efforts);
  const previewEffort = efforts[previewIndex];
  const progressRatio = frame / PREVIEW_MAX_FRAME;
  const tooltipLabel = indicatorLabel(frame, bindEffort ? efforts : [], { withLevel: fine });



  const commit = async (rawFrame: number) => {
    if (!bindEffort) {
      dragging.current = false;
      setFrame(rawFrame);
      presenter.setFrame(rawFrame);
      return;
    }
    const fineFrame = fine ? snapFrame(rawFrame) : rawFrame;
    const targetIndex = nearestEffortIndex(fineFrame, efforts);
    const target = efforts[targetIndex];
    if (target === undefined) return;
    const targetFrame = fine ? fineFrame : frameForEffort(targetIndex, efforts.length);
    dragging.current = false;
    setFrame(targetFrame);
    presenter.setFrame(targetFrame);
    if (targetIndex === committedIndex || pending) return;
    if (fine) sync.current.submit(JSON.stringify([modelKey, target.id]), selectionKey, modeKey);
    setPending(true);
    setFailed(false);
    const accepted = await select({
      provider: reasoning.selection.provider,
      model: reasoning.selection.model,
      reasoningEffort: target.id,
    });
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
      title={bindEffort ? previewEffort?.name : undefined}
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
        {efforts.map((effort, index) => (
          <i
            className="liang-effort-control__tick"
            key={effort.id}
            style={{ left: `${(frameForEffort(index, efforts.length) / PREVIEW_MAX_FRAME) * 100}%` }}
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
        aria-valuetext={bindEffort ? previewEffort?.name ?? "" : tooltipLabel}
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
      zh: { ...SETTINGS_LOCALES.zh, ...UPDATE_LOCALES.zh },
      en: { ...SETTINGS_LOCALES.en, ...UPDATE_LOCALES.en },
    }),
    "liang-intensity-skin: settings locale",
  );

  // The official Plugins page owns this slot. inject waits for it without
  // making plugin-page services mandatory for the skin on older hosts.
  ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
    name: "plugins.bundle.config",
    key: BUNDLE_PACKAGE_ID,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope, updater }),
  }, SettingsPanel));

  const settingsTitle = ctx.locale.bind(LOCALE_NAMESPACE);
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "liang-skin-settings",
    order: 46,
    label: () => settingsTitle("settings.title"),
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope, updater }),
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
