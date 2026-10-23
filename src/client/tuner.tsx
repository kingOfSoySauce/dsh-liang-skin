import { useEffect, useMemo, useState } from "react";

export type TuneStateId = "idle" | "running" | "preview";

export interface TuneState {
  opacity: number;
  scale: number;
  cut: number;
  feather: number;
}

export interface TuneValues {
  idle: TuneState;
  running: TuneState;
  preview: TuneState;
  veil: {
    plateau: number;
    a90: number;
    a96: number;
    edge: number;
    ew: number;
    eh: number;
    cx: number;
    cy: number;
  };
  image: {
    objectY: number;
    width: number;
    brightness: number;
    contrast: number;
    scrim: number;
  };
  mask: {
    edgeX: number;
    edgeY: number;
    featherX: number;
    featherY: number;
  };
}

export const TUNE_DEFAULTS: TuneValues = {
  idle: { opacity: 0.45, scale: 1.035, cut: 30, feather: 26.7 },
  running: { opacity: 0.85, scale: 1, cut: 20, feather: 40 },
  preview: { opacity: 1, scale: 1, cut: 10, feather: 40 },
  veil: { plateau: 72, a90: 0.9, a96: 0.7, edge: 0.12, ew: 46, eh: 80, cx: 75, cy: 36 },
  image: { objectY: 36, width: 42, brightness: 1.2, contrast: 1.05, scrim: 0.3 },
  mask: { edgeX: 0, edgeY: 0, featherX: 32, featherY: 26 },
};

const KEY = "dsh-liang-tune.v5";

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
  const veil = values.veil;
  style.setProperty("--liang-tune-plateau", `${veil.plateau}%`);
  style.setProperty("--liang-tune-a90", String(veil.a90));
  style.setProperty("--liang-tune-a96", String(veil.a96));
  style.setProperty("--liang-tune-edge", String(veil.edge));
  style.setProperty("--liang-tune-ew", `${veil.ew}%`);
  style.setProperty("--liang-tune-eh", `${veil.eh}%`);
  style.setProperty("--liang-tune-cx", `${veil.cx}%`);
  style.setProperty("--liang-tune-cy", `${veil.cy}%`);
  style.setProperty("--liang-tune-object-y", `${values.image.objectY}%`);
  style.setProperty("--liang-tune-width", `${values.image.width}vw`);
  style.setProperty("--liang-tune-brightness", String(values.image.brightness));
  style.setProperty("--liang-tune-contrast", String(values.image.contrast));
  style.setProperty("--liang-tune-scrim", String(values.image.scrim));

  // Inline styles win over any stale stylesheet that a hot reload left behind.
  const root = document.querySelector(".liang-skin-backdrop");

  const state = root?.dataset.preview === "true"
    ? "preview"
    : root?.dataset.engaged === "true"
      ? "running"
      : "idle";
  const current = values[state];
  const veilCss = `radial-gradient(ellipse ${veil.ew}% ${veil.eh}% at ${veil.cx}% ${veil.cy}%, #000 0%, #000 ${veil.plateau}%, rgba(0,0,0,0.97) 72%, rgba(0,0,0,0.86) 82%, rgba(0,0,0,${veil.a90}) 90%, rgba(0,0,0,${veil.a96}) 96%, rgba(0,0,0,${veil.edge}) 100%)`;
  for (const stack of Array.from(document.querySelectorAll<HTMLElement>(".liang-skin-portrait-stack"))) {
    stack.style.setProperty("--liang-veil", veilCss);
    stack.style.webkitMaskImage = veilCss;
    stack.style.maskImage = veilCss;
    stack.style.setProperty("--liang-corner-cut", `${current.cut}%`);
    stack.style.setProperty("--liang-corner-feather", `${current.feather}%`);
    stack.style.opacity = String(current.opacity);
    stack.style.transform = `scale(${current.scale})`;
    stack.style.filter = `brightness(${values.image.brightness}) contrast(${values.image.contrast})`;
    const mask = values.mask;
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

function loadTune(): TuneValues {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return TUNE_DEFAULTS;
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
  const [link, setLink] = useState(true);
  const [values, setValues] = useState<TuneValues>(loadTune);

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
    setValues((current) => {
      if (!link) return { ...current, [tab]: { ...current[tab], ...patch } };
      const next = { ...current };
      for (const id of ["idle", "running", "preview"] as const) {
        next[id] = { ...next[id], ...patch };
      }
      return next;
    });
  };
  const setVeil = (patch: Partial<TuneValues["veil"]>) => {
    setValues((current) => ({ ...current, veil: { ...current.veil, ...patch } }));
  };
  const setImage = (patch: Partial<TuneValues["image"]>) => {
    setValues((current) => ({ ...current, image: { ...current.image, ...patch } }));
  };
  const setMask = (patch: Partial<TuneValues["mask"]>) => {
    setValues((current) => ({ ...current, mask: { ...current.mask, ...patch } }));
  };

  const rows = useMemo(() => ([
    { key: "opacity", label: "透明度", min: 0, max: 1, step: 0.01, value: state.opacity, patch: (v: number) => setState({ opacity: v }) },
    { key: "scale", label: "缩放", min: 0.9, max: 1.1, step: 0.005, value: state.scale, patch: (v: number) => setState({ scale: v }) },
    { key: "cut", label: "圆角 %", min: 0, max: 50, step: 1, value: state.cut, patch: (v: number) => setState({ cut: v }) },
    { key: "feather", label: "羽化 %", min: 0, max: 100, step: 1, value: state.feather, patch: (v: number) => setState({ feather: v }) },
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
        <div className="liang-tuner__panel" role="dialog" aria-label="背景人像参数">
          <div className="liang-tuner__head">
            <strong>背景人像参数</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="关闭">×</button>
          </div>
          <label className="liang-tuner__link">
            <input type="checkbox" checked={link} onChange={(event) => setLink(event.target.checked)} />
            联动三态（改一个，三个一起变）
          </label>
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
              ["平台 %", values.veil.plateau, 40, 80, 1, (v: number) => setVeil({ plateau: v })],
              ["90% 处 α", values.veil.a90, 0, 1, 0.01, (v: number) => setVeil({ a90: v })],
              ["96% 处 α", values.veil.a96, 0, 1, 0.01, (v: number) => setVeil({ a96: v })],
              ["边缘 α", values.veil.edge, 0, 0.3, 0.005, (v: number) => setVeil({ edge: v })],
              ["椭圆宽 %", values.veil.ew, 20, 70, 1, (v: number) => setVeil({ ew: v })],
              ["椭圆高 %", values.veil.eh, 30, 90, 1, (v: number) => setVeil({ eh: v })],
              ["中心 X %", values.veil.cx, 0, 100, 1, (v: number) => setVeil({ cx: v })],
              ["中心 Y %（小=上）", values.veil.cy, 0, 100, 1, (v: number) => setVeil({ cy: v })],
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
              ["左右羽化 %", values.mask.featherX, 0, 50, 1, (v: number) => setMask({ featherX: v })],
              ["上下羽化 %", values.mask.featherY, 0, 50, 1, (v: number) => setMask({ featherY: v })],
              ["左右边缘 α", values.mask.edgeX, 0, 1, 0.01, (v: number) => setMask({ edgeX: v })],
              ["上下边缘 α", values.mask.edgeY, 0, 1, 0.01, (v: number) => setMask({ edgeY: v })],
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
              ["亮度", values.image.brightness, 0.5, 2, 0.01, (v: number) => setImage({ brightness: v })],
              ["对比度", values.image.contrast, 0.5, 2, 0.01, (v: number) => setImage({ contrast: v })],
              ["背景压暗", values.image.scrim, 0, 1, 0.01, (v: number) => setImage({ scrim: v })],
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
            <button type="button" onClick={() => setValues(TUNE_DEFAULTS)}>重置</button>
          </div>
        </div>
      )}
    </span>
  );
}
