import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Switch } from "@deepseek-ai/dsh-client-ui-primitives";
import type { Context as ClientContext } from "@deepseek-ai/cordis";
import type { SnapshotStore } from "@deepseek-ai/dsh-client-store";
import type {} from "@deepseek-ai/dsh-client-ui-conversation/client";
import type {} from "@deepseek-ai/dsh-client-ui-settings/client";
import type {} from "@deepseek-ai/dsh-client-ui-model-selection/client";
import styles from "./skin.css";
import { installLiangAppearanceButton } from "./appearance";
import { createAmbient, type AmbientHandle } from "./ambient";
import { LiangTuner, type TuneStateId } from "./tuner";
import { createPortraitLoader } from "./portrait-loader";
import {
  FINE_STEPS,
  PREVIEW_MAX_FRAME,
  frameForEffort,
  frameForLevel,
  indicatorLabel,
  nearestEffortIndex,
  paletteForFrame,
  selectedEffortIndex,
  snapFrame,
  type EffortLike,
} from "./logic";

const PACKAGE_ID = "dsh-client-liang-intensity-skin";
// Temporary tuning entry: flip to false once the values are settled.
const SHOW_TUNER = true;
const LOCALE_NAMESPACE = "liang.skin";
const ASSET_PREFIX = `/plugins/${PACKAGE_ID}/assets`;
const BIND_EFFORT_KEY = "dsh-liang-intensity-skin.bind-effort";

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

interface SkinSettings {
  enabled: boolean;
  bindEffort: boolean;
}

interface PreferenceStore {
  getSnapshot(): SkinSettings;
  subscribe(listener: () => void): () => void;
  set(enabled: boolean): Promise<void>;
  setBindEffort(enabled: boolean): Promise<void>;
  dispose(): void;
}

type NativeThemeId = "light" | "dark";

interface ThemeService {
  getTheme(): { preference: string };
  setTheme(id: NativeThemeId | "system"): void;
}

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

interface SessionLike {
  subscribe(listener: () => void): () => void;
  getSnapshot(): { running?: boolean } | null;
}

interface SliderProps {
  directory: SnapshotStore<ModelDirectoryState>;
  load: () => void;
  select: (selection: ModelSelection) => Promise<boolean>;
  presenter: SkinPresenter;
  scope: PreferenceStore;
  session?: SessionLike;
}

interface EffortBindingRowProps {
  scope: PreferenceStore;
  t: (key: string) => string;
}

const cssVariables = [
  "--liang-strength",
  "--liang-page",
  "--liang-bg-base",
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
  private readonly theme: ThemeService;
  private readonly root: HTMLDivElement;
  private readonly stack: HTMLDivElement;
  private readonly layers: [HTMLImageElement, HTMLImageElement];
  private readonly canvas: HTMLCanvasElement;
  private readonly ambient: AmbientHandle;
  private readonly portraits: ReturnType<typeof createPortraitLoader>;
  private enabled = true;
  private activeLayer: 0 | 1 = 1;
  private currentUrl: string | null = null;
  private clearTimer: number | null = null;
  // Default to the max frame so the first paint after load is the dark shell;
  // starting at 0 flashed the light palette before the directory resolved.
  private frame = PREVIEW_MAX_FRAME;
  private pendingFrame = PREVIEW_MAX_FRAME;
  private raf = 0;
  private disposed = false;
  private unsubscribe: () => void;

  constructor(scope: PreferenceStore, theme: ThemeService) {
    this.scope = scope;
    this.theme = theme;
    this.root = document.createElement("div");
    this.root.className = "liang-skin-backdrop";
    this.root.dataset.plugin = PACKAGE_ID;
    this.root.dataset.media = "color";
    this.root.dataset.engaged = "false";
    this.root.setAttribute("aria-hidden", "true");

    this.stack = document.createElement("div");
    this.stack.className = "liang-skin-portrait-stack";
    const layer = () => {
      const image = document.createElement("img");
      image.className = "liang-skin-frame";
      image.alt = "";
      image.draggable = false;
      image.dataset.active = "false";
      this.stack.append(image);
      return image;
    };
    this.layers = [layer(), layer()];

    this.canvas = document.createElement("canvas");
    this.canvas.className = "liang-skin-ambient";
    this.ambient = createAmbient(this.canvas);

    this.root.append(this.stack, this.canvas);

    this.portraits = createPortraitLoader({
      sources: PORTRAIT_ANCHORS.map(({ level, file }) => ({
        level,
        url: `${ASSET_PREFIX}/portrait-source-xianxia-v2/${file}`,
      })),
      onChange: ({ url }) => {
        if (this.disposed || !this.enabled) return;
        if (url === null) {
          this.root.dataset.media = "color";
          this.currentUrl = null;
          for (const image of this.layers) {
            image.dataset.active = "false";
            image.removeAttribute("src");
          }
          return;
        }
        this.showPortrait(url);
      },
    });

    window.addEventListener("resize", () => this.syncAnchor());
    this.unsubscribe = scope.subscribe(() => this.syncSettings());
    this.syncSettings();
  }

  /** Crossfade between decoded frames so a level change never hard-cuts. */
  private showPortrait(url: string) {
    if (url === this.currentUrl) return;
    const nextIndex = this.activeLayer === 0 ? 1 : 0;
    const next = this.layers[nextIndex];
    const previous = this.layers[this.activeLayer];
    this.currentUrl = url;
    this.root.dataset.media = "sequence";
    next.src = url;
    next.dataset.active = "true";
    previous.dataset.active = "false";
    this.activeLayer = nextIndex;
    if (this.clearTimer !== null) window.clearTimeout(this.clearTimer);
    this.clearTimer = window.setTimeout(() => {
      this.clearTimer = null;
      const idle = this.layers[this.activeLayer === 0 ? 1 : 0];
      if (idle.dataset.active === "false") idle.removeAttribute("src");
    }, 800);
  }

  private syncSettings() {
    this.setEnabled(this.scope.getSnapshot().enabled);
  }

  /** Aim the plume at the active portrait's face. */
  private syncTarget() {
    const frame = this.layers.find((layer) => layer.dataset.active === "true");
    if (frame === undefined) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return;
    this.ambient.setTarget(rect.left + rect.width * 0.5, rect.top + rect.height * 0.38);
  }

  /** Spill particles from the composer's lower-left corner. */
  private syncAnchor() {
    const input = document.querySelector<HTMLElement>('[contenteditable="true"]');
    if (input === null) return;
    const rect = input.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 10) return;
    this.ambient.setAnchor(rect.right - 22, rect.bottom - 6);
    this.syncTarget();
  }

  /** Reveal the immortal only while the turn is running; idle returns to the void. */
  setEngaged(engaged: boolean) {
    if (this.disposed) return;
    this.root.dataset.engaged = engaged ? "true" : "false";
  }

  /** While the user drags the slider the portrait shows at full strength. */
  setPreviewing(previewing: boolean) {
    if (this.disposed) return;
    this.root.dataset.preview = previewing ? "true" : "false";
  }

  isEnabled() {
    return this.enabled;
  }

  getFrame() {
    return this.frame;
  }

  setEnabled(enabled: boolean) {
    if (this.disposed) return;
    this.enabled = enabled;
    if (enabled) {
      if (!this.root.isConnected) document.body.prepend(this.root);
      document.body.dataset.liangSkin = "on";
      this.applyFrame();
      this.portraits.start();
      this.ambient.start();
      this.syncAnchor();
      window.setTimeout(() => this.syncAnchor(), 400);
    } else {
      if (this.raf !== 0) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.ambient.stop();
      if (this.clearTimer !== null) {
        window.clearTimeout(this.clearTimer);
        this.clearTimer = null;
      }
      this.root.remove();
      this.portraits.stop();
      this.currentUrl = null;
      for (const image of this.layers) {
        image.dataset.active = "false";
        image.removeAttribute("src");
      }
      this.root.dataset.media = "color";
      delete document.body.dataset.liangSkin;
      delete document.body.dataset.liangStage;
      for (const name of cssVariables) document.body.style.removeProperty(name);
    }
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
    this.syncNativeTheme(palette.stage === 5 ? "dark" : "light");
    body.dataset.liangStage = String(palette.stage);
    body.style.setProperty("--liang-strength", String(palette.strength));
    body.style.setProperty("--liang-page", palette.page);
    body.style.setProperty("--liang-bg-base", palette.base);
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
    this.ambient.setLevel(palette.level, palette.stage === 5);
    this.syncAnchor();
    this.syncTarget();
    this.updatePortrait(palette.level);
  }

  syncNativeTheme(theme: NativeThemeId = paletteForFrame(this.frame).stage === 5 ? "dark" : "light") {
    if (!this.enabled || this.theme.getTheme().preference === theme) return;
    this.theme.setTheme(theme);
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
    if (this.raf !== 0) cancelAnimationFrame(this.raf);
    this.portraits.dispose();
    this.ambient.dispose();
    if (this.clearTimer !== null) {
      window.clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }
    this.root.remove();
    document.body.removeAttribute("data-liang-skin");
    delete document.body.dataset.liangStage;
    for (const name of cssVariables) document.body.style.removeProperty(name);
  }
}

function useSessionRunning(session: SessionLike | undefined) {
  const subscribe = (listener: () => void) => session?.subscribe(listener) ?? (() => {});
  const getSnapshot = () => session?.getSnapshot() ?? null;
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return snapshot?.running === true;
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

function LiangEffortSlider({ directory, load, select, presenter, scope, session }: SliderProps) {
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
  const committedFrame = committedIndex < 0
    ? PREVIEW_MAX_FRAME
    : frameForEffort(committedIndex, efforts.length);
  const bindEffort = skin.bindEffort;
  const [frame, setFrame] = useState(() => bindEffort ? committedFrame : presenter.getFrame());
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const dragging = useRef(false);
  const dragStartFrame = useRef(frame);
  // Effort index this slider committed itself, and the last index the effect
  // observed. The effect must only follow *external* effort changes (model
  // switch, native picker); otherwise a selection round-trip would re-render
  // with the stale index and yank the thumb off the fine stop the user chose.
  const selfCommitted = useRef(-1);
  const lastCommitted = useRef(committedIndex);
  const enabled = skin.enabled;
  const running = useSessionRunning(session);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  useEffect(() => {
    presenter.setEngaged(running);
  }, [presenter, running]);

  useEffect(() => () => presenter.setEngaged(false), [presenter]);

  useEffect(() => {
    const previous = lastCommitted.current;
    lastCommitted.current = committedIndex;
    if (!bindEffort || dragging.current || pending) return;
    // While the host re-selects a model the effort can read as unknown for a
    // render; that must not yank the thumb to the max frame.
    if (state.status === "selecting") return;
    if (committedIndex < 0 && selfCommitted.current >= 0) return;
    // Same effort as before, or the host just caught up with our own submit:
    // keep the fine stop instead of snapping back to the effort anchor.
    if (committedIndex === previous) return;
    if (selfCommitted.current === committedIndex) return;
    setFrame(committedFrame);
    presenter.setFrame(committedFrame);
  }, [bindEffort, committedFrame, committedIndex, pending, presenter, state.status]);

  if (!enabled) return null;
  if (bindEffort && (reasoning === null || efforts.length < 2)) return null;

  const previewIndex = nearestEffortIndex(frame, efforts);
  const previewEffort = efforts[previewIndex];
  const progressRatio = frame / PREVIEW_MAX_FRAME;
  const tooltipLabel = indicatorLabel(frame, bindEffort ? efforts : [], { withLevel: true });

  const commit = async (rawFrame: number) => {
    if (!bindEffort) {
      dragging.current = false;
      setFrame(rawFrame);
      presenter.setFrame(rawFrame);
      return;
    }
    // Land on the fine grid instead of jumping to the effort anchor: the
    // slider now has FINE_STEPS + 1 usable positions, and only the submitted
    // id is rounded to the nearest effort the model actually offers.
    const targetFrame = snapFrame(rawFrame);
    const targetIndex = nearestEffortIndex(targetFrame, efforts);
    const target = efforts[targetIndex];
    if (target === undefined) return;
    dragging.current = false;
    selfCommitted.current = targetIndex;
    setFrame(targetFrame);
    presenter.setFrame(targetFrame);
    if (targetIndex === committedIndex || pending) return;
    setPending(true);
    setFailed(false);
    const accepted = await select({
      provider: reasoning.selection.provider,
      model: reasoning.selection.model,
      reasoningEffort: target.id,
    });
    setPending(false);
    if (!accepted) {
      setFailed(true);
      setFrame(committedFrame);
      presenter.setFrame(committedFrame);
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
        {Array.from({ length: FINE_STEPS + 1 }, (_, level) => (
          <i
            className="liang-effort-control__tick liang-effort-control__tick--minor"
            key={`fine-${level}`}
            style={{ left: `${(frameForLevel(level) / PREVIEW_MAX_FRAME) * 100}%` }}
          />
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
        step={1}
        value={frame}
        disabled={pending || state.status === "selecting"}
        aria-label={bindEffort ? "思考等级" : "皮肤进度"}
        aria-valuetext={bindEffort ? previewEffort?.name ?? "" : tooltipLabel}
        onPointerDown={() => {
          dragging.current = true;
          dragStartFrame.current = frame;
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
        onPointerCancel={() => {
          setInteracting(false);
          presenter.setPreviewing(false);
          dragging.current = false;
          setFrame(dragStartFrame.current);
          presenter.setFrame(dragStartFrame.current);
        }}
        onKeyUp={(event) => {
          setInteracting(false);
          presenter.setPreviewing(false);
          if (event.key !== "Escape") void commit(Number(event.currentTarget.value));
        }}
        onBlur={(event) => {
          setInteracting(false);
          if (dragging.current) void commit(Number(event.currentTarget.value));
        }}
        onKeyDown={(event) => {
          setInteracting(true);
          if (event.key === "Escape" && !pending) {
            setInteracting(false);
            dragging.current = false;
            setFrame(dragStartFrame.current);
            presenter.setFrame(dragStartFrame.current);
          }
        }}
      />
      {SHOW_TUNER && <LiangTuner
        onForce={(state: TuneStateId) => {
          if (state === "idle") {
            presenter.setPreviewing(false);
            presenter.setEngaged(false);
          } else if (state === "running") {
            presenter.setPreviewing(false);
            presenter.setEngaged(true);
          } else {
            presenter.setEngaged(true);
            presenter.setPreviewing(true);
          }
        }}
      />}
    </div>
  );
}

function EffortBindingRow({ scope, t }: EffortBindingRowProps) {
  const snapshot = useSyncExternalStore(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot(),
  );
  const [pending, setPending] = useState(false);
  if (!snapshot.enabled) return null;

  return (
    <div className="liang-appearance-binding" data-plugin={PACKAGE_ID}>
      <span>{t("effort.binding")}</span>
      <Switch
        checked={snapshot.bindEffort}
        disabled={pending}
        label={t("effort.binding")}
        onChange={(next) => {
          if (pending) return;
          setPending(true);
          void scope.setBindEffort(next).catch(() => undefined).finally(() => setPending(false));
        }}
      />
    </div>
  );
}

export const inject = [
  "slots",
  "sessions",
  "modelDirectories",
  "locale",
  "theme",
];

function createPreferenceStore(): PreferenceStore {
  // The market's active skin is the source of truth for whether this client
  // should be visible. The appearance switch is therefore scoped to this
  // client activation and must not survive switching away and back.
  try {
    localStorage.removeItem("dsh-liang-intensity-skin.enabled");
  } catch {
    // Storage may be unavailable; the in-memory default still enables Liang.
  }
  let snapshot: SkinSettings = {
    enabled: true,
    bindEffort: localStorage.getItem(BIND_EFFORT_KEY) !== "0",
  };
  const listeners = new Set<() => void>();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== BIND_EFFORT_KEY) return;
    const next = {
      enabled: snapshot.enabled,
      bindEffort: event.newValue !== "0",
    };
    if (next.enabled === snapshot.enabled && next.bindEffort === snapshot.bindEffort) return;
    snapshot = next;
    for (const listener of listeners) listener();
  };
  window.addEventListener("storage", onStorage);
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async set(enabled) {
      if (enabled === snapshot.enabled) return;
      snapshot = { ...snapshot, enabled };
      for (const listener of listeners) listener();
    },
    async setBindEffort(bindEffort) {
      if (bindEffort === snapshot.bindEffort) return;
      localStorage.setItem(BIND_EFFORT_KEY, bindEffort ? "1" : "0");
      snapshot = { ...snapshot, bindEffort };
      for (const listener of listeners) listener();
    },
    dispose() {
      window.removeEventListener("storage", onStorage);
      listeners.clear();
    },
  };
}

export function apply(ctx: ClientContext) {
  const style = document.createElement("style");
  style.dataset.plugin = PACKAGE_ID;
  style.textContent = styles;
  document.head.append(style);
  ctx.effect(() => () => style.remove(), "liang-intensity-skin: scoped styles");

  const scope = createPreferenceStore();
  ctx.effect(() => () => scope.dispose(), "liang-intensity-skin: appearance preference");
  const theme = ctx.get("theme") as ThemeService;
  const presenter = new SkinPresenter(scope, theme);
  ctx.effect(() => () => presenter.dispose(), "liang-intensity-skin: backdrop presenter");
  ctx.effect(
    () => installLiangAppearanceButton(scope, presenter, PACKAGE_ID),
    "liang-intensity-skin: native appearance extension",
  );
  ctx.effect(
    () => ctx.locale.register(LOCALE_NAMESPACE, {
      zh: { "effort.binding": "滑动变祖绑定思考等级" },
      en: { "effort.binding": "Bind slider to reasoning level" },
    }), "liang-intensity-skin: settings locale");

  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "liang-effort-binding",
    order: 10.5,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope }),
  }, EffortBindingRow));

  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "liang-intensity-control",
    order: 10,
    inject: (sessionId: string) => {
      const available = ctx.sessions.subagentAddress(sessionId) === undefined;
      const directory = ctx.modelDirectories.directoryFor(sessionId) as ModelDirectory;
      const scopeCtx = (ctx.sessions as { scope?: (id: string) => unknown }).scope?.(sessionId);
      const session = scopeCtx === undefined
        ? undefined
        : (ctx.sessions as { sessionOf?: (scope: unknown) => SessionLike }).sessionOf?.(scopeCtx);
      return {
        directory: directory.store,
        presenter,
        scope,
        session,
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
