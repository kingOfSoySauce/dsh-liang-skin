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
  };
}

export const TUNE_DEFAULTS: TuneValues = {
  idle: { opacity: 0.3, scale: 1.035, cut: 30, feather: 26.7 },
  running: { opacity: 0.7, scale: 1, cut: 20, feather: 40 },
  preview: { opacity: 1, scale: 1, cut: 10, feather: 40 },
  veil: { plateau: 62, a90: 0.58, a96: 0.24, edge: 0.02, ew: 40, eh: 56 },
};

const KEY = "dsh-liang-tune.v1";

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
}

function loadTune(): TuneValues {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return TUNE_DEFAULTS;
    const parsed = JSON.parse(raw) as TuneValues;
    return { ...TUNE_DEFAULTS, ...parsed, veil: { ...TUNE_DEFAULTS.veil, ...parsed.veil } };
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
}

export function LiangTuner({ onForce }: TunerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TuneStateId>("idle");
  const [values, setValues] = useState<TuneValues>(loadTune);

  useEffect(() => {
    applyTune(values);
    try {
      localStorage.setItem(KEY, JSON.stringify(values));
    } catch {
      // Storage may be unavailable; the live values still apply.
    }
  }, [values]);

  const state = values[tab];
  const setState = (patch: Partial<TuneState>) => {
    setValues((current) => ({ ...current, [tab]: { ...current[tab], ...patch } }));
  };
  const setVeil = (patch: Partial<TuneValues["veil"]>) => {
    setValues((current) => ({ ...current, veil: { ...current.veil, ...patch } }));
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
        onClick={() => setOpen((value) => !value)}
      >
        ⚙
      </button>
      {open && (
        <div className="liang-tuner__panel" role="dialog" aria-label="背景人像参数">
          <div className="liang-tuner__head">
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
              ["平台 %", values.veil.plateau, 40, 80, 1, (v: number) => setVeil({ plateau: v })],
              ["90% 处 α", values.veil.a90, 0, 1, 0.01, (v: number) => setVeil({ a90: v })],
              ["96% 处 α", values.veil.a96, 0, 1, 0.01, (v: number) => setVeil({ a96: v })],
              ["边缘 α", values.veil.edge, 0, 0.3, 0.005, (v: number) => setVeil({ edge: v })],
              ["椭圆宽 %", values.veil.ew, 20, 70, 1, (v: number) => setVeil({ ew: v })],
              ["椭圆高 %", values.veil.eh, 30, 90, 1, (v: number) => setVeil({ eh: v })],
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
