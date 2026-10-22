export const PREVIEW_MAX_FRAME = 240;
export const MAX_LEVEL = 30;

const LIANG_RANKS = ["小难梁", "牢梁", "梁子", "梁圣", "梁神", "梁祖"] as const;

export interface EffortLike {
  id: string;
  name: string;
  description?: string;
}

export interface Palette {
  level: number;
  stage: number;
  strength: number;
  page: string;
  base: string;
  layer1: string;
  layer2: string;
  layer3: string;
  sidebar: string;
  ink: string;
  secondary: string;
  tertiary: string;
  border: string;
  accent: string;
  accentHover: string;
  hover: string;
  portraitOpacity: string;
}

type Rgb = readonly [number, number, number];

interface PaletteStop {
  at: number;
  page: Rgb;
  surface: Rgb;
  surface2: Rgb;
  ink: Rgb;
  secondary: Rgb;
  accent: Rgb;
  portraitOpacity: number;
}

// These are the original calibrator's six stage anchors: pale neutral at the
// low end, progressively smoked surfaces, then charcoal and antique gold.
const STOPS: readonly PaletteStop[] = [
  { at: 0, page: [232, 233, 229], surface: [248, 248, 245], surface2: [238, 239, 235], ink: [23, 24, 22], secondary: [112, 116, 111], accent: [181, 43, 36], portraitOpacity: 0.92 },
  { at: 6, page: [211, 211, 206], surface: [239, 239, 234], surface2: [224, 224, 218], ink: [26, 26, 24], secondary: [101, 101, 96], accent: [181, 43, 36], portraitOpacity: 0.93 },
  { at: 12, page: [171, 168, 162], surface: [211, 208, 201], surface2: [190, 186, 179], ink: [27, 26, 24], secondary: [83, 79, 74], accent: [166, 54, 42], portraitOpacity: 0.94 },
  { at: 18, page: [117, 112, 106], surface: [154, 148, 140], surface2: [128, 122, 115], ink: [24, 22, 20], secondary: [65, 61, 56], accent: [154, 56, 42], portraitOpacity: 0.94 },
  { at: 24, page: [43, 39, 37], surface: [48, 43, 40], surface2: [58, 51, 46], ink: [244, 241, 232], secondary: [184, 180, 169], accent: [181, 92, 54], portraitOpacity: 0.94 },
  { at: 30, page: [17, 17, 17], surface: [30, 27, 25], surface2: [41, 35, 30], ink: [244, 241, 232], secondary: [184, 180, 169], accent: [193, 154, 73], portraitOpacity: 0.94 },
];

export function clampFrame(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(PREVIEW_MAX_FRAME, Math.max(0, Math.round(value)));
}

export function frameForEffort(index: number, count: number): number {
  if (count <= 1 || !Number.isFinite(index)) return 0;
  const safe = Math.min(count - 1, Math.max(0, Math.round(index)));
  return Math.round((safe / (count - 1)) * PREVIEW_MAX_FRAME);
}

/**
 * Fine subdivision of the 0–30 intensity scale. The model wire only accepts
 * off/low/high/max, so these stops are visual: every stop still submits the
 * nearest real effort id while the skin keeps the exact sub-level.
 */
export const FINE_STEPS = MAX_LEVEL;
export const FRAMES_PER_STEP = PREVIEW_MAX_FRAME / FINE_STEPS;

export function frameForLevel(level: number): number {
  const safe = Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(0, Math.round(level))) : 0;
  return Math.round((safe / FINE_STEPS) * PREVIEW_MAX_FRAME);
}

export function levelForFrame(rawFrame: number): number {
  return Math.round((clampFrame(rawFrame) / PREVIEW_MAX_FRAME) * FINE_STEPS);
}

/** Snap a preview frame onto the fine grid so the thumb stays where it landed. */
export function snapFrame(rawFrame: number): number {
  return frameForLevel(levelForFrame(rawFrame));
}

export function nearestEffortIndex(frame: number, efforts: readonly EffortLike[]): number {
  if (efforts.length === 0) return -1;
  const safe = clampFrame(frame);
  let best = 0;
  let distance = Math.abs(safe - frameForEffort(0, efforts.length));
  for (let index = 1; index < efforts.length; index += 1) {
    const next = Math.abs(safe - frameForEffort(index, efforts.length));
    if (next < distance) {
      best = index;
      distance = next;
    }
  }
  return best;
}

export function selectedEffortIndex(
  efforts: readonly EffortLike[],
  selectedId?: string,
  defaultId?: string,
): number {
  const id = selectedId ?? defaultId;
  return id === undefined ? -1 : efforts.findIndex((effort) => effort.id === id);
}

export function portraitBlendForLevel(level: number, anchors: readonly number[]) {
  if (anchors.length === 0) return { lowerIndex: -1, upperIndex: -1, mix: 0 };
  const safeLevel = Number.isFinite(level)
    ? Math.min(anchors[anchors.length - 1], Math.max(anchors[0], level))
    : anchors[0];
  let upperIndex = anchors.findIndex((anchor) => anchor >= safeLevel);
  if (upperIndex < 0) upperIndex = anchors.length - 1;
  const lowerIndex = Math.max(0, upperIndex - (anchors[upperIndex] > safeLevel ? 1 : 0));
  const span = anchors[upperIndex] - anchors[lowerIndex];
  return {
    lowerIndex,
    upperIndex,
    mix: span === 0 ? 0 : (safeLevel - anchors[lowerIndex]) / span,
  };
}

export function liangRankForFrame(rawFrame: number): string {
  const level = (clampFrame(rawFrame) / PREVIEW_MAX_FRAME) * MAX_LEVEL;
  const index = level >= MAX_LEVEL ? LIANG_RANKS.length - 1 : Math.floor(level / 6);
  return LIANG_RANKS[Math.min(LIANG_RANKS.length - 1, Math.max(0, index))];
}

export function indicatorLabel(
  rawFrame: number,
  efforts: readonly EffortLike[],
  options: { withLevel?: boolean } = {},
): string {
  const rank = options.withLevel === true
    ? `${liangRankForFrame(rawFrame)} ${levelForFrame(rawFrame)}`
    : liangRankForFrame(rawFrame);
  const effort = efforts[nearestEffortIndex(rawFrame, efforts)];
  return effort === undefined ? rank : `${rank} · ${effort.name}`;
}

function lerp(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return [
    Math.round(lerp(a[0], b[0], amount)),
    Math.round(lerp(a[1], b[1], amount)),
    Math.round(lerp(a[2], b[2], amount)),
  ];
}

function rgb(value: Rgb, alpha = 1): string {
  return alpha === 1
    ? `rgb(${value[0]} ${value[1]} ${value[2]})`
    : `rgb(${value[0]} ${value[1]} ${value[2]} / ${alpha})`;
}

export function paletteForFrame(rawFrame: number): Palette {
  const frame = clampFrame(rawFrame);
  const level = (frame / PREVIEW_MAX_FRAME) * MAX_LEVEL;
  const portraitStage = Math.min(5, Math.floor(level / 6));
  const portraitFrom = STOPS[portraitStage];
  const portraitTo = STOPS[Math.min(5, portraitStage + 1)];
  const portraitAmount = portraitFrom === portraitTo
    ? 0
    : (level - portraitFrom.at) / (portraitTo.at - portraitFrom.at);

  // The UI itself is intentionally binary: levels 0–23 keep the native light
  // shell; entering the original 梁神/梁祖 region at level 24 switches black/gold.
  const dark = level >= 24;
  const stage = dark ? 5 : 0;
  const ui = dark ? STOPS[5] : STOPS[0];
  const page = ui.page;
  const surface = ui.surface;
  const surface2 = ui.surface2;
  const sidebar = mix(page, surface2, 0.25);
  const ink = ui.ink;
  const secondary = ui.secondary;
  // Keep Harness' native blue in the light shell. The original calibrator's
  // antique gold only becomes the product accent once the dark region begins.
  const accent: Rgb = dark ? [193, 154, 73] : [65, 118, 230];
  const accentHover = mix(accent, ink, 0.13);

  return {
    level,
    stage,
    strength: level / MAX_LEVEL,
    page: rgb(page),
    // Keep the shell readable while allowing the right-side portrait to remain
    // visibly present. Dense controls use the opaque layer tokens below.
    base: rgb(page, dark ? 0.42 : 0.28),
    layer1: rgb(surface, 0.94),
    layer2: rgb(surface2, 0.96),
    layer3: rgb(surface2, 0.99),
    sidebar: rgb(sidebar, 0.96),
    ink: rgb(ink),
    secondary: rgb(secondary),
    tertiary: rgb(mix(secondary, page, 0.28)),
    border: rgb(ink, dark ? 0.15 : 0.12),
    accent: rgb(accent),
    accentHover: rgb(accentHover),
    hover: rgb(ink, dark ? 0.09 : 0.07),
    portraitOpacity: String(lerp(
      portraitFrom.portraitOpacity,
      portraitTo.portraitOpacity,
      portraitAmount,
    )),
  };
}
