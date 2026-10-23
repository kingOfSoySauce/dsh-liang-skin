import { useEffect, useMemo, useRef, useState } from "react";

export type TuneStateId = "idle" | "running" | "preview";

export interface Veil {
  plateau: number;
  a50: number;
  a85: number;
  edge: number;
  ew: number;
  eh: number;
  cx: number;
  cy: number;
}

export interface Mask {
  edgeX: number;
  edgeY: number;
  featherX: number;
  featherY: number;
}

export interface TuneState {
  opacity: number;
  scale: number;
  cut: number;
  feather: number;
  scrim: number;
  veil: Veil;
  mask: Mask;
}

export interface TuneValues {
  idle: TuneState;
  running: TuneState;
  preview: TuneState;
  image: {
    objectY: number;
    width: number;
  };
}

const BASE_VEIL: Veil = { plateau: 31, a50: 0.24, a85: 0.11, edge: 0, ew: 46, eh: 80, cx: 78, cy: 36 };
const BASE_MASK: Mask = { edgeX: 0, edgeY: 0, featherX: 14, featherY: 10 };

export const TUNE_DEFAULTS: TuneValues = {
  idle: { opacity: 0.22, scale: 1.035, cut: 30, feather: 46, scrim: 0.5, veil: { ...BASE_VEIL }, mask: { ...BASE_MASK } },
  running: { opacity: 0.67, scale: 1, cut: 20, feather: 46, scrim: 0.5, veil: { ...BASE_VEIL }, mask: { ...BASE_MASK } },
  preview: { opacity: 1, scale: 1, cut: 10, feather: 46, scrim: 0.5, veil: { ...BASE_VEIL }, mask: { ...BASE_MASK } },
  image: { objectY: 36, width: 42 },
};

const KEY = "dsh-liang-tune.v9";
const DEFAULTS_KEY = "dsh-liang-tune.defaults";
const POS_KEY = "dsh-liang-tune.pos";

function loadPos(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    return raw === null ? null : (JSON.parse(raw) as { x: number; y: number });
  } catch {
    return null;
  }
}

/** Push the tuned values onto the document as CSS variables. */
export function applyTune(values: TuneValues) {
  const style = document.body.style;
  for (const id of ["idle", "running", "preview"] as const) {
    const state = values[id];
    style.setProperty(`--liang-tune-${id}-opacity`, String(state.opacity));
    style.setProperty(`--liang-tune-${id}-scale`, String(state.scale));
    style.setProperty(`--liang-tune-${id}-cut`, `${state.cut}%`);
    style.setProperty(`--liang-tune-${id}-feather`, `${state.feather}%`);
  }
  style.setProperty("--liang-tune-object-y", `${values.image.objectY}%`);
  style.setProperty("--liang-tune-width", `${values.image.width}vw`);

  // Inline styles win over any stale stylesheet that a hot reload left behind.
  const root = document.querySelector(".liang-skin-backdrop");

  const state = root?.dataset.preview === "true"
    ? "preview"
    : root?.dataset.engaged === "true"
      ? "running"
      : "idle";
  const current = values[state];
  const veil = current.veil;
  const mask = current.mask;
  style.setProperty("--liang-tune-scrim", String(current.scrim));
  const veilCss = [
    `#000 0%`,
    `#000 ${veil.plateau}%`,
    ...(veil.plateau < 50 ? [`rgba(0,0,0,${veil.a50}) 50%`] : []),
    ...(veil.plateau < 85 ? [`rgba(0,0,0,${veil.a85}) 85%`] : []),
    `rgba(0,0,0,${veil.edge}) 100%`,
  ].join(", ");
  const veilGradient = `radial-gradient(ellipse ${veil.ew}% ${veil.eh}% at ${veil.cx}% ${veil.cy}%, ${veilCss})`;
  for (const stack of Array.from(document.querySelectorAll<HTMLElement>(".liang-skin-portrait-stack"))) {
    stack.style.setProperty("--liang-veil", veilGradient);
    stack.style.webkitMaskImage = veilGradient;
    stack.style.maskImage = veilGradient;
    stack.style.opacity = String(current.opacity);
    stack.style.transform = `scale(${current.scale})`;
    const edgeX = `rgb(0 0 0 / ${mask.edgeX})`;
    const edgeY = `rgb(0 0 0 / ${mask.edgeY})`;
    const hMask = `linear-gradient(90deg, ${edgeX} 0%, rgb(0 0 0 / 1) ${mask.featherX}%, rgb(0 0 0 / 1) ${100 - mask.featherX}%, ${edgeX} 100%)`;
    const vMask = `linear-gradient(180deg, ${edgeY} 0%, rgb(0 0 0 / 1) ${mask.featherY}%, rgb(0 0 0 / 1) ${100 - mask.featherY}%, ${edgeY} 100%)`;
    for (const frame of Array.from(stack.querySelectorAll<HTMLElement>("img.liang-skin-frame"))) {
      frame.style.objectPosition = `50% ${values.image.objectY}%`;
      frame.style.width = `min(${values.image.width}vw, 720px)`;
      frame.style.setProperty("--liang-image-h", hMask);
      frame.style.setProperty("--liang-image-v", vMask);
    }
  }
}

function loadDefaults(): TuneValues {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (raw === null) return TUNE_DEFAULTS;
    const parsed = JSON.parse(raw) as TuneValues;
    const merge = (id: "idle" | "running" | "preview") => ({
      ...TUNE_DEFAULTS[id],
      ...parsed[id],
      veil: { ...TUNE_DEFAULTS[id].veil, ...parsed[id]?.veil },
      mask: { ...TUNE_DEFAULTS[id].mask, ...parsed[id]?.mask },
    });
    return { idle: merge("idle"), running: merge("running"), preview: merge("preview"), image: { ...TUNE_DEFAULTS.image, ...parsed.image } };
  } catch {
    return TUNE_DEFAULTS;
  }
}

function loadTune(): TuneValues {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return loadDefaults();
    const parsed = JSON.parse(raw) as TuneValues;
    return {
      ...TUNE_DEFAULTS,
      ...parsed,
      veil: { ...TUNE_DEFAULTS.veil, ...parsed.veil },
      image: { ...TUNE_DEFAULTS.image, ...parsed.image },
      mask: { ...TUNE_DEFAULTS.mask, ...parsed.mask },
    };
  } catch {
    return TUNE_DEFAULTS;
  }
}

const STATE_LABEL: Record<TuneStateId, string> = {
  idle: "空闲",
  running: "进行中",
  preview: "拖动",
};

interface TunerProps {
  onForce: (state: TuneStateId) => void;
  liveState: () => TuneStateId;
}

export function LiangTuner({ onForce, liveState }: TunerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TuneStateId>("idle");
  const [values, setValues] = useState<TuneValues>(loadTune);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(loadPos);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panelX: number; panelY: number } | null>(null);

  useEffect(() => {
    if (pos !== null) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(pos));
      } catch {
        // Position is a convenience only.
      }
    }
  }, [pos]);

  useEffect(() => {
    applyTune(values);
    try {
      localStorage.setItem(KEY, JSON.stringify(values));
    } catch {
      // Storage may be unavailable; the live values still apply.
    }
    // Keep the inline opacity in sync with idle/running/preview transitions.
    // A hot reload can leave the previous generation's timer alive; clear it
    // first so stale values never overwrite the current ones.
    const host = window as typeof window & { __liangTunerTimer?: number };
    if (host.__liangTunerTimer !== undefined) window.clearInterval(host.__liangTunerTimer);
    const timer = window.setInterval(() => applyTune(values), 400);
    host.__liangTunerTimer = timer;
    return () => {
      window.clearInterval(timer);
      if (host.__liangTunerTimer === timer) host.__liangTunerTimer = undefined;
    };
  }, [values]);

  const state = values[tab];
  const setState = (patch: Partial<TuneState>) => {
    setValues((current) => ({ ...current, [tab]: { ...current[tab], ...patch } }));
  };
  const setVeil = (patch: Partial<Veil>) => {
    setValues((current) => ({ ...current, [tab]: { ...current[tab], veil: { ...current[tab].veil, ...patch } } }));
  };
  const setImage = (patch: Partial<TuneValues["image"]>) => {
    setValues((current) => ({ ...current, image: { ...current.image, ...patch } }));
  };
  const setMask = (patch: Partial<Mask>) => {
    setValues((current) => ({ ...current, [tab]: { ...current[tab], mask: { ...current[tab].mask, ...patch } } }));
  };

  const rows = useMemo(() => ([
    { key: "opacity", label: "透明度", min: 0, max: 1, step: 0.01, value: state.opacity, patch: (v: number) => setState({ opacity: v }) },
    { key: "scale", label: "缩放", min: 0.9, max: 1.1, step: 0.005, value: state.scale, patch: (v: number) => setState({ scale: v }) },
    { key: "scrim", label: "背景压暗 0-10", min: 0, max: 10, step: 0.1, value: state.scrim, patch: (v: number) => setValues((current) => ({ ...current, [tab]: { ...current[tab], scrim: v } })) },
  ]), [state, tab]);

  return (
    <span className="liang-tuner">
      <button
        type="button"
        className="liang-tuner__toggle"
        title="调整背景人像参数"
        aria-label="调整背景人像参数"
        data-open={open ? "true" : "false"}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            const live = liveState();
            setTab(live);
            onForce(live);
          }
        }}
      >
        ⚙
      </button>
      {open && (
        <div
          ref={panelRef}
          className="liang-tuner__panel"
          role="dialog"
          aria-label="背景人像参数"
          style={pos === null ? undefined : { left: pos.x, top: pos.y, bottom: "auto", transform: "none" }}
        >
          <div
            className="liang-tuner__head"
            style={{ cursor: "grab", touchAction: "none" }}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest("button") !== null) return;
              const rect = panelRef.current?.getBoundingClientRect();
              if (rect === undefined) return;
              dragRef.current = { startX: event.clientX, startY: event.clientY, panelX: rect.left, panelY: rect.top };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (dragRef.current === null) return;
              const drag = dragRef.current;
              const width = panelRef.current?.offsetWidth ?? 330;
              const x = Math.max(0, Math.min(window.innerWidth - width, drag.panelX + event.clientX - drag.startX));
              const y = Math.max(0, Math.min(window.innerHeight - 60, drag.panelY + event.clientY - drag.startY));
              setPos({ x, y });
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
          >
            <strong>背景人像参数</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="关闭">×</button>
          </div>
          <div className="liang-tuner__tabs">
            {(["idle", "running", "preview"] as const).map((id) => (
              <button
                key={id}
                type="button"
                data-active={tab === id ? "true" : "false"}
                onClick={() => {
                  setTab(id);
                  onForce(id);
                }}
              >
                {STATE_LABEL[id]}
              </button>
            ))}
          </div>
          <div className="liang-tuner__rows">
            {rows.map((row) => (
              <label key={row.key} className="liang-tuner__row">
                <span>{row.label}</span>
                <input
                  type="range"
                  min={row.min}
                  max={row.max}
                  step={row.step}
                  value={row.value}
                  onChange={(event) => row.patch(Number(event.target.value))}
                />
                <output>{row.value.toFixed(row.step < 0.01 ? 3 : (row.step < 1 ? 2 : 0))}</output>
              </label>
            ))}
          </div>
          <div className="liang-tuner__section">高斯蒙版（三态共用）</div>
          <div className="liang-tuner__rows">
            {([
              ["平台 %", state.veil.plateau, 0, 90, 1, (v: number) => setVeil({ plateau: v })],
              ["50% 处 α", state.veil.a50, 0, 1, 0.01, (v: number) => setVeil({ a50: v })],
              ["85% 处 α", state.veil.a85, 0, 1, 0.01, (v: number) => setVeil({ a85: v })],
              ["边缘 α", state.veil.edge, 0, 0.3, 0.005, (v: number) => setVeil({ edge: v })],
              ["椭圆宽 %", state.veil.ew, 5, 70, 1, (v: number) => setVeil({ ew: v })],
              ["椭圆高 %", state.veil.eh, 5, 90, 1, (v: number) => setVeil({ eh: v })],
              ["中心 X %", state.veil.cx, 0, 100, 1, (v: number) => setVeil({ cx: v })],
              ["中心 Y %（小=上）", state.veil.cy, 0, 100, 1, (v: number) => setVeil({ cy: v })],
            ] as const).map(([label, value, min, max, step, patch]) => (
              <label key={label} className="liang-tuner__row">
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => patch(Number(event.target.value))}
                />
                <output>{Number(value).toFixed(step < 0.01 ? 3 : (step < 1 ? 2 : 0))}</output>
              </label>
            ))}
          </div>
          <div className="liang-tuner__section">边缘羽化（人物图自身蒙版）</div>
          <div className="liang-tuner__rows">
            {([
              ["左右羽化 %", state.mask.featherX, 0, 50, 1, (v: number) => setMask({ featherX: v })],
              ["上下羽化 %", state.mask.featherY, 0, 50, 1, (v: number) => setMask({ featherY: v })],
              ["左右边缘 α", state.mask.edgeX, 0, 1, 0.01, (v: number) => setMask({ edgeX: v })],
              ["上下边缘 α", state.mask.edgeY, 0, 1, 0.01, (v: number) => setMask({ edgeY: v })],
            ] as const).map(([label, value, min, max, step, patch]) => (
              <label key={label} className="liang-tuner__row">
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => patch(Number(event.target.value))}
                />
                <output>{Number(value).toFixed(step < 1 ? 2 : 0)}</output>
              </label>
            ))}
          </div>
          <div className="liang-tuner__section">人物图</div>
          <div className="liang-tuner__rows">
            {([
              ["垂直位置 %", values.image.objectY, 0, 100, 1, (v: number) => setImage({ objectY: v })],
              ["宽度 vw", values.image.width, 20, 70, 1, (v: number) => setImage({ width: v })],
            ] as const).map(([label, value, min, max, step, patch]) => (
              <label key={label} className="liang-tuner__row">
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => patch(Number(event.target.value))}
                />
                <output>{Number(value).toFixed(0)}</output>
              </label>
            ))}
          </div>
          <div className="liang-tuner__foot">
            <button
              type="button"
              onClick={() => {
                const text = `/* liang tune */\n${JSON.stringify(values, null, 2)}`;
                void navigator.clipboard?.writeText(text).catch(() => undefined);
              }}
            >
              复制参数
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(DEFAULTS_KEY, JSON.stringify(values));
                } catch {
                  // Defaults are a convenience only.
                }
              }}
            >
              设为默认
            </button>
            <button type="button" onClick={() => setValues(loadDefaults())}>重置</button>
          </div>
        </div>
      )}
    </span>
  );
}
