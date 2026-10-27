window.__ModuleLoader__.load({id:"@leon___/dsh-client-liang-intensity-skin",factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react3 = require("react");

// src/client/skin.css
var skin_default = `.liang-skin-backdrop {
  /* The host conversation column is the containing block. Keeping the stage
     inside that column avoids crossing the Windows frame stacking context. */
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--liang-page, transparent);
  opacity: 0;
  transition: opacity 220ms ease, background-color 180ms linear;
}

body[data-liang-skin="on"] .liang-skin-backdrop {
  opacity: 1;
}

.liang-skin-backdrop img {
  position: absolute;
  top: 50%;
  right: 0;
  display: block;
  width: min(42vw, 720px);
  height: 100%;
  object-fit: cover;
  object-position: 50% 42%;
  opacity: var(--liang-portrait-opacity, 1);
  transform: translateY(-50%);
  filter: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.12) 6%, rgba(0, 0, 0, 0.55) 16%, black 34%, black 100%);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.12) 6%, rgba(0, 0, 0, 0.55) 16%, black 34%, black 100%);
  transition: filter 180ms linear;
}

.liang-skin-backdrop img {
  display: none;
}

.liang-skin-backdrop[data-media="sequence"] .liang-skin-sequence-frame {
  display: block;
  opacity: var(--liang-portrait-opacity, 1);
}

.liang-skin-backdrop[data-media="color"] img {
  display: none;
}

.liang-skin-backdrop::after {
  position: absolute;
  inset: 0;
  display: none;
  content: "";
  background:
    linear-gradient(90deg, var(--liang-mask-strong, transparent) 0%, var(--liang-mask-soft, transparent) 38%, transparent 66%),
    linear-gradient(var(--liang-mask-base, transparent), var(--liang-mask-base, transparent));
}

/* The scrim is stage-local: it desaturates the portrait without painting over
   transcript text or native portals. The switch makes the two visual systems
   directly comparable on a real WebView. */
.liang-skin-backdrop[data-mask="on"]::after {
  display: block;
}

body[data-liang-skin="on"] {
  /* Keep the backdrop above the canvas but below content and native portals.
     The host owns root positioning, dimensions, and its own stacking order. */
  isolation: isolate;
  --dsw-alias-bg-base: transparent !important;
  --dsw-alias-bg-layer-1: var(--liang-layer-1) !important;
  --dsw-alias-bg-layer-2: var(--liang-layer-2) !important;
  --dsw-alias-bg-layer-3: var(--liang-layer-3) !important;
  --dsw-specific-sidebar-fill: var(--liang-sidebar) !important;
  --dsw-alias-label-primary: var(--liang-ink) !important;
  --dsw-alias-label-primary-dimmed: var(--liang-ink) !important;
  --dsw-alias-label-secondary: var(--liang-secondary) !important;
  --dsw-alias-label-tertiary: var(--liang-tertiary) !important;
  --dsw-alias-label-caption: var(--liang-tertiary) !important;
  --dsw-alias-border-l1: var(--liang-border) !important;
  --dsw-alias-border-l2-darkmode-thin: var(--liang-border) !important;
  --dsw-alias-border-l2: var(--liang-border) !important;
  --dsw-alias-border-l3: var(--liang-border) !important;
  --dsw-alias-button-primary-fill: var(--liang-accent) !important;
  --dsw-alias-button-primary-hover: var(--liang-accent-hover) !important;
  --dsw-alias-button-info-fill: var(--liang-accent) !important;
  --dsw-alias-button-info-hover: var(--liang-accent-hover) !important;
  --dsw-alias-state-business-primary: var(--liang-accent) !important;
  --dsw-alias-interactive-bg-hover: var(--liang-hover) !important;
  --dsw-alias-interactive-bg-active: var(--liang-hover) !important;
  --dsw-alias-button-elevated-fill: var(--liang-layer-1) !important;
  --dsw-alias-button-floating-fill: var(--liang-layer-2) !important;
  --dsw-alias-button-floating-hover: var(--liang-layer-3) !important;
  --dsw-alias-interactive-bg-hover-solid: var(--liang-layer-2) !important;
  --dsw-specific-bubble: var(--liang-layer-2) !important;
  --dsw-specific-input-major: var(--liang-layer-1) !important;
  --dsw-specific-menu: var(--liang-layer-3) !important;
  --dsw-specific-selector: var(--liang-layer-2) !important;
  --dsw-alias-markdown-citation: var(--liang-layer-2) !important;
  --dsw-alias-markdown-code-block-banner: var(--liang-layer-1) !important;
  --dsw-alias-markdown-code-block: var(--liang-layer-1) !important;
  --dsw-alias-markdown-code-segment-selected: var(--liang-layer-2) !important;
  --dsw-alias-markdown-code-segment-unselected: var(--liang-layer-1) !important;
  --dsw-alias-markdown-inline-code: var(--liang-layer-2) !important;
  --dsw-alias-markdown-placeholder: var(--liang-layer-1) !important;
  --dsw-alias-markdown-tag: var(--liang-layer-2) !important;
  background: var(--liang-page) !important;
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) {
  --dsw-alias-brand-primary-new-colorprimary-new-color: rgb(65, 118, 230) !important;
  --dsw-alias-brand-primary: rgb(15, 17, 21) !important;
  --dsw-alias-brand-text: rgb(15, 17, 21) !important;
  --dsw-alias-button-primary-fill: rgb(15, 17, 21) !important;
  --dsw-alias-button-primary-hover: rgb(53, 54, 56) !important;
  --dsw-alias-button-info-fill: rgb(65, 118, 230) !important;
  --dsw-alias-button-info-hover: rgb(103, 158, 254) !important;
  --dsw-alias-state-business-primary: rgb(65, 118, 230) !important;
  --dsw-alias-label-primary-inverted: rgb(249, 250, 251) !important;
  --dsw-alias-button-elevated-fill: rgb(255, 255, 255) !important;
  --dsw-alias-button-floating-fill: rgb(255, 255, 255) !important;
  --dsw-alias-button-floating-hover: rgb(241, 243, 245) !important;
  --dsw-alias-interactive-bg-hover-solid: rgb(241, 243, 245) !important;
  --dsw-specific-bubble: rgb(237, 243, 254) !important;
  --dsw-specific-input-major: rgb(255, 255, 255) !important;
  --dsw-specific-menu: rgb(255, 255, 255) !important;
  --dsw-specific-selector: rgb(245, 246, 247) !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] {
  --dsw-alias-brand-primary-new-colorprimary-new-color: #c19a49 !important;
  --dsw-alias-brand-primary: #c19a49 !important;
  --dsw-alias-brand-text: #d5b56e !important;
  --dsw-alias-button-info-fill: #c19a49 !important;
  --dsw-alias-button-info-hover: #d5b56e !important;
  --dsw-alias-state-business-primary: #c19a49 !important;
  --dsw-alias-bg-module-platform: var(--liang-layer-3) !important;
  --dsw-specific-sidebar-nav-item-active: var(--liang-layer-3) !important;
  --dsw-specific-sidebar-nav-item-hover: var(--liang-hover) !important;
}

/* The host renders the running-turn label as a clipped blue text gradient.
   Retarget only that gradient's color tokens in the custom dark skin; keep
   the host's text clipping and shimmer behavior, and leave light mode alone. */
body[data-liang-skin="on"][data-liang-stage="5"] [class*="_turnStatus"] {
  --dsw-static-deepseek-500: #c19a49 !important;
  --dsw-static-deepseek-200: #d5b56e !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] [class*="_turnStatusClock"] {
  color: #c19a49 !important;
  -webkit-text-fill-color: #c19a49 !important;
}

/* Preserve the wordmark badge contrast in the low-intensity shell. */
body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"] svg[viewBox="0 0 182 24"] > rect[width="52"] {
  fill: rgb(15, 17, 21) !important;
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"] svg[viewBox="0 0 182 24"] > g[clip-path*="badge"] path {
  fill: rgb(249, 250, 251) !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"] svg[viewBox="0 0 182 24"] > rect[width="52"] {
  fill: #c19a49 !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"] svg[viewBox="0 0 182 24"] > g[clip-path*="badge"] path {
  fill: #171816 !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] [aria-label^="\u9009\u62E9\u6A21\u578B"] > span:nth-of-type(2) {
  color: #d5b56e !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] [class*="heroGlow"] ellipse {
  fill: #c19a49 !important;
  fill-opacity: 0.16 !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] span[class*="_previewBadge"] {
  color: #171816 !important;
  background: #c19a49 !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] button[aria-label="\u53D1\u9001\u6D88\u606F"] {
  color: #171816 !important;
}

body[data-liang-skin="on"][data-liang-stage="5"] button[aria-label="\u53D1\u9001\u6D88\u606F"]:disabled {
  opacity: 0.62;
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) button[aria-label="\u53D1\u9001\u6D88\u606F"] {
  color: #fff !important;
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) button[aria-label="\u53D1\u9001\u6D88\u606F"]:disabled {
  color: rgba(255, 255, 255, 0.92) !important;
  background: rgba(65, 118, 230, 0.42) !important;
  opacity: 1;
}

body[data-liang-skin="on"] > #root {
  background: transparent !important;
}

/* The stage owns the center column's background. The ConversationRoot paints
   after it in DOM order, while fixed native portals keep their page-level tier. */
body[data-liang-skin="on"] #root [data-pane="conversation"],
body[data-liang-skin="on"] #root [class*="centerCol"] {
  position: relative;
  background: transparent !important;
}

/* Every page rendered inside the center column must paint after the stage.
   Plugin detail pages do not have [data-phase], so limiting this to the chat
   transcript lets the z-index:0 stage cover their unpositioned text. No
   z-index is introduced, so native fixed popups are not trapped here. */
body[data-liang-skin="on"] #root [data-pane="conversation"] > :not(.liang-skin-backdrop),
body[data-liang-skin="on"] #root [class*="centerCol"] > :not(.liang-skin-backdrop) {
  position: relative;
}

/* The official Plugins page is a painted section inside a display:contents
   slot wrapper. Positioning that wrapper cannot affect paint order. Position
   the page box itself (without creating a stacking context) so its text stays
   above the stage, just like its already-positioned native controls. */
body[data-liang-skin="on"] #root :is([data-pane="conversation"], [class*="centerCol"]) > :is([style*="display: contents"], [style*="display:contents"]) > section[class$="_page"] {
  position: relative;
}

/* Native account pages are full-screen body portals. Their header and loading
   surface must stay opaque when the chat background token is transparent. */
body[data-liang-skin="on"] > [role="dialog"][aria-modal="true"][class*="_overlay"]:has(> header[data-window-drag] button[class*="_back"]):has(> [class*="_viewport"]) {
  --dsw-alias-bg-base: var(--liang-page, #fff) !important;
  background: var(--liang-page, #fff) !important;
}

/* macOS adds different translucent sidebar materials for native light/dark.
   While Liang is active, the effort palette owns the sidebar fill. */
html[data-platform="darwin"] body[data-liang-skin="on"] #root [class*="sidebarCol"] {
  background: var(--liang-sidebar) !important;
}

/* Keep the host's expanded new-session surface on the same palette. The
   collapsed icon keeps its native transparent surface and hover behavior. */
html[data-platform="darwin"] body[data-liang-skin="on"] #root [class*="_sidebarCol"] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) button[class*="_newSession"] {
  background: var(--dsw-alias-button-elevated-fill) !important;
}

html[data-platform="darwin"] body[data-liang-skin="on"] #root [class*="_sidebarCol"] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) button[class*="_newSession"]:hover {
  background: var(--dsw-alias-button-floating-hover) !important;
}

/* The native dark rule also outranks the collapsed icon's transparent fill. */
html[data-platform="darwin"] body[data-liang-skin="on"] #root [class*="_sidebarCol"] [class*="_root"][class*="_collapsed"]:has(> [class*="_logoRow"]) button[class*="_newSession"] {
  background: transparent !important;
}

html[data-platform="darwin"] body[data-liang-skin="on"] #root [class*="_sidebarCol"] [class*="_root"][class*="_collapsed"]:has(> [class*="_logoRow"]) button[class*="_newSession"]:hover {
  background: var(--dsw-alias-interactive-bg-hover) !important;
}

body[data-liang-skin="on"] button,
body[data-liang-skin="on"] input,
body[data-liang-skin="on"] textarea {
  transition: color 160ms linear, background-color 160ms linear, border-color 160ms linear;
}

/* The composer card has a native theme-mode fill, so keep its surface and
   readable ink aligned with the active Liang palette. */
body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) [data-composer-card="true"] {
  border-color: var(--liang-border) !important;
  color: var(--liang-ink) !important;
  background: var(--liang-layer-1) !important;
  box-shadow: 0 8px 28px rgba(20, 22, 20, 0.08);
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) [data-composer-card="true"] :is(textarea, button, [data-input-mirror="true"]) {
  color: var(--liang-ink) !important;
  caret-color: var(--liang-accent) !important;
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) [data-composer-card="true"] textarea::placeholder {
  color: var(--liang-tertiary) !important;
  opacity: 1;
}

.liang-effort-control {
  --liang-control-accent: var(--dsw-alias-brand-primary-new-colorprimary-new-color, #4176e6);
  --liang-control-rail: var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.16));
  position: relative;
  display: flex;
  width: 124px;
  height: 28px;
  align-items: center;
  margin: 0 3px;
  overflow: visible;
}

body[data-liang-skin="on"] .liang-effort-control {
  --liang-control-accent: var(--liang-secondary);
}

.liang-effort-control__ticks {
  position: absolute;
  z-index: 0;
  inset: 0 10px;
  pointer-events: none;
}

.liang-effort-control__ticks::before {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  content: "";
  background: var(--liang-control-rail);
  transform: translateY(-50%);
}

.liang-effort-control__tooltip {
  position: absolute;
  z-index: 4;
  bottom: calc(100% + 7px);
  left: calc(10px + (100% - 20px) * var(--liang-slider-ratio));
  min-width: max-content;
  padding: 5px 8px;
  border: 1px solid var(--liang-border, rgba(0, 0, 0, 0.12));
  border-radius: 7px;
  color: var(--liang-ink, #171816);
  background: var(--liang-layer-1, #fff);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.16);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.01em;
  pointer-events: none;
  transform: translateX(-50%);
  white-space: nowrap;
}

.liang-effort-control__tooltip::after {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 7px;
  height: 7px;
  content: "";
  background: inherit;
  transform: translate(-50%, -4px) rotate(45deg);
}

.liang-effort-control__tick {
  position: absolute;
  top: 50%;
  width: 1px;
  height: 7px;
  background: var(--liang-control-accent);
  opacity: 0.42;
  transform: translate(-50%, -50%);
}

.liang-effort-control__range {
  position: relative;
  z-index: 1;
  width: calc(100% - 7px);
  height: 28px;
  margin: 0 3.5px;
  cursor: ew-resize;
  appearance: none;
  background: transparent;
  touch-action: pan-y;
}

.liang-effort-control__range:disabled {
  cursor: progress;
  opacity: 0.58;
}

.liang-effort-control__range::-webkit-slider-runnable-track {
  height: 1px;
  border-radius: 1px;
  background: transparent;
}

.liang-effort-control__range::-webkit-slider-thumb {
  width: 13px;
  height: 13px;
  margin-top: -6px;
  border: 1.5px solid var(--liang-control-border, var(--liang-control-accent));
  border-radius: 50%;
  appearance: none;
  background: radial-gradient(circle, var(--liang-control-accent) 0 2px, var(--liang-control-fill, var(--dsw-alias-bg-layer-1, #fff)) 2.5px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
}

body[data-liang-skin="on"] .liang-effort-control__range::-webkit-slider-thumb {
  width: 13px;
  height: 13px;
  margin-top: -6px;
  border-color: var(--liang-control-border, var(--liang-control-accent));
  background: radial-gradient(circle, var(--liang-control-accent) 0 2px, var(--liang-control-fill, var(--liang-layer-1, #fff)) 2.5px);
}

.liang-effort-control__range::-moz-range-track {
  height: 1px;
  background: transparent;
}

.liang-effort-control__range::-moz-range-progress {
  height: 1px;
  background: transparent;
}

.liang-effort-control__range::-moz-range-thumb {
  width: 11px;
  height: 11px;
  border: 1.5px solid var(--liang-control-border, var(--liang-control-accent));
  border-radius: 50%;
  background: var(--liang-control-fill, var(--dsw-alias-bg-layer-1, #fff));
}

.liang-effort-control__range:focus-visible {
  outline: none;
}

.liang-effort-control[data-state="error"] {
  --liang-control-accent: var(--dsw-alias-state-error-primary, #e43c3c);
}

@media (max-width: 760px) {
  .liang-effort-control {
    width: 92px;
  }

  .liang-skin-backdrop img {
    right: -18vw;
    width: 92vw;
    opacity: 1;
  }

}

@media (prefers-reduced-motion: reduce) {
  .liang-skin-backdrop,
  .liang-skin-backdrop img,
  body[data-liang-skin="on"] button,
  body[data-liang-skin="on"] input,
  body[data-liang-skin="on"] textarea {
    transition: none;
  }
}
`;

// src/client/optional-visuals.css
var optional_visuals_default = '/* These rules become active only when the corresponding optional feature is\n   instantiated. The original portrait rules remain the default. */\n.liang-effort-control__tick--minor {\n  height: 3px;\n  opacity: 0.38;\n}\n\n.liang-skin-backdrop[data-motion="on"][data-media="sequence"] .liang-skin-sequence-frame {\n  opacity: calc(var(--liang-portrait-opacity, 1) * var(--liang-motion-opacity, 1));\n  transform: translateY(-50%) scale(var(--liang-motion-scale, 1));\n  transform-origin: 50% 42%;\n  transition: opacity 1400ms ease, transform 1400ms ease, filter 180ms linear;\n}\n\n.liang-skin-backdrop[data-motion="on"][data-motion-state="preview"] .liang-skin-sequence-frame {\n  transition-duration: 260ms;\n}\n\n.liang-ambient {\n  position: absolute;\n  inset: 0;\n  z-index: 2;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .liang-skin-backdrop[data-motion="on"] .liang-skin-sequence-frame {\n    transition: none;\n  }\n}\n';

// src/client/ambient.ts
var MAX_PARTICLES = 3300;
var TAU = Math.PI * 2;
var VERTEX = `
attribute vec2 a_pos;
attribute float a_size;
attribute float a_alpha;
attribute vec3 a_color;
uniform vec2 u_res;
uniform float u_scale;
uniform float u_alpha;
varying float v_alpha;
varying vec3 v_color;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = a_size * u_scale;
  v_alpha = a_alpha * u_alpha;
  v_color = a_color;
}
`;
var FRAGMENT = `
precision mediump float;
varying float v_alpha;
varying vec3 v_color;
void main() {
  float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (r > 1.0) discard;
  float core = pow(max(0.0, 1.0 - r), 2.6);
  float halo = pow(max(0.0, 1.0 - r), 1.1) * 0.35;
  gl_FragColor = vec4(v_color, (core + halo) * v_alpha);
}
`;
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function mix(a, b, amount) {
  return a + (b - a) * amount;
}
function noopHandle() {
  return { setLevel() {
  }, setAnchor() {
  }, setTarget() {
  }, start() {
  }, stop() {
  }, dispose() {
  } };
}
function createAmbient(canvas) {
  const doc = canvas.ownerDocument;
  const view = doc.defaultView;
  if (view === null) return noopHandle();
  let display;
  let gl = null;
  let glCanvas = null;
  const shaders = [];
  const buffers = [];
  let program = null;
  let released = false;
  const release = (operation) => {
    try {
      operation();
    } catch {
    }
  };
  const releaseGPU = () => {
    if (released) return;
    released = true;
    if (gl !== null) {
      const context = gl;
      for (const buffer of buffers) release(() => context.deleteBuffer(buffer));
      if (program !== null) release(() => context.deleteProgram(program));
      for (const shader of shaders) release(() => context.deleteShader(shader));
      release(() => context.getExtension("WEBGL_lose_context")?.loseContext());
    }
    if (glCanvas !== null) glCanvas.width = glCanvas.height = 0;
  };
  let positionLocation;
  let sizeLocation;
  let alphaLocation;
  let colorLocation;
  let resolutionLocation;
  let scaleLocation;
  let alphaLocationU;
  try {
    display = canvas.getContext("2d");
    if (display === null) return noopHandle();
    glCanvas = doc.createElement("canvas");
    gl = glCanvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "default"
    });
    if (gl === null) {
      releaseGPU();
      return noopHandle();
    }
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      if (shader === null) throw new Error("Cannot allocate particle shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Cannot compile particle shader");
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    program = gl.createProgram();
    if (program === null) throw new Error("Cannot allocate particle program");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Cannot link particle program");
    gl.useProgram(program);
    for (let index = 0; index < 4; index += 1) {
      const buffer = gl.createBuffer();
      if (buffer === null) throw new Error("Cannot allocate particle buffer");
      buffers.push(buffer);
    }
    positionLocation = gl.getAttribLocation(program, "a_pos");
    sizeLocation = gl.getAttribLocation(program, "a_size");
    alphaLocation = gl.getAttribLocation(program, "a_alpha");
    colorLocation = gl.getAttribLocation(program, "a_color");
    const resolution = gl.getUniformLocation(program, "u_res");
    const scale = gl.getUniformLocation(program, "u_scale");
    const alpha = gl.getUniformLocation(program, "u_alpha");
    if ([positionLocation, sizeLocation, alphaLocation, colorLocation].some((value) => value < 0) || resolution === null || scale === null || alpha === null) throw new Error("Incomplete particle program");
    resolutionLocation = resolution;
    scaleLocation = scale;
    alphaLocationU = alpha;
  } catch {
    releaseGPU();
    return noopHandle();
  }
  const gpu = gl;
  const gpuCanvas = glCanvas;
  const surface = display;
  const positions = new Float32Array(MAX_PARTICLES * 2);
  const sizes = new Float32Array(MAX_PARTICLES);
  const alphas = new Float32Array(MAX_PARTICLES);
  const colors = new Float32Array(MAX_PARTICLES * 3);
  const particles = [];
  const query = typeof view.matchMedia === "function" ? view.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let reduced = query?.matches ?? false;
  let requested = false;
  let disposed = false;
  let raf = null;
  let observer = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let last = 0;
  let time = 0;
  let level = 20;
  let dark = false;
  let smoothLevel = level;
  let smoothDark = 0;
  let active = 0;
  let anchorX = 0.86;
  let anchorY = 0.8;
  let targetX = 0.78;
  let targetY = 0.4;
  let pointerX = -1e4;
  let pointerY = -1e4;
  let pointerVX = 0;
  let pointerVY = 0;
  let pointerDown = false;
  let lastPointer = 0;
  const reset = (particle, randomLife) => {
    const spread = width * 0.05;
    particle.x = anchorX * width + (Math.random() - 0.5) * spread * 2;
    particle.y = anchorY * height + (Math.random() - 0.5) * spread * 1.4;
    particle.vx = (Math.random() - 0.5) * 90;
    particle.vy = -30 - Math.random() * 110;
    particle.maxLife = 3 + Math.random() * 4;
    particle.life = randomLife ? Math.random() * particle.maxLife : 0;
    particle.size = 2 + Math.random() * 3.2;
    particle.phase = Math.random() * TAU;
  };
  const clear = () => {
    gpu.clear(gpu.COLOR_BUFFER_BIT);
    surface.clearRect(0, 0, canvas.width, canvas.height);
  };
  const cancelFrame = () => {
    if (raf !== null) view.cancelAnimationFrame(raf);
    raf = null;
    last = 0;
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const nextDpr = clamp(view.devicePixelRatio || 1, 1, 1.5);
    const nextWidth = Math.max(0, Math.round(rect.width * nextDpr));
    const nextHeight = Math.max(0, Math.round(rect.height * nextDpr));
    if (nextWidth === width && nextHeight === height && dpr === nextDpr) return;
    dpr = nextDpr;
    width = nextWidth;
    height = nextHeight;
    gpuCanvas.width = canvas.width = width;
    gpuCanvas.height = canvas.height = height;
    gpu.viewport(0, 0, width, height);
    gpu.uniform2f(resolutionLocation, width, height);
    for (const particle of particles) reset(particle, true);
  };
  const simulate = (dt) => {
    active = Math.round(240 + smoothLevel / 30 * (MAX_PARTICLES - 240));
    const levelFactor = 0.45 + 0.55 * (smoothLevel / 30);
    const radius = Math.min(width, height) * 0.34;
    const repelling = pointerDown || Math.hypot(pointerVX, pointerVY) > 1.4;
    for (let index = 0; index < active; index += 1) {
      const particle = particles[index];
      particle.life += dt;
      if (particle.life > particle.maxLife) reset(particle, false);
      const curl = Math.sin(particle.y * 16e-4 + time * 0.25 + particle.phase);
      particle.vx += curl * width * 0.02 * dt + (Math.random() - 0.5) * width * 0.05 * dt;
      particle.vy -= height * 8e-3 * dt;
      particle.vy += (Math.random() - 0.5) * height * 0.03 * dt;
      const dx = pointerX - particle.x;
      const dy = pointerY - particle.y;
      const distance = Math.hypot(dx, dy);
      if (pointerX > -1e3 && distance < radius && distance > 1e-3) {
        const falloff = 1 - distance / radius;
        const nx = dx / distance;
        const ny = dy / distance;
        if (repelling) {
          particle.vx -= nx * falloff * 900 * dt;
          particle.vy -= ny * falloff * 900 * dt;
        } else {
          particle.vx += (nx * 90 - ny * 130) * falloff * dt;
          particle.vy += (ny * 90 + nx * 130) * falloff * dt;
        }
      }
      const toFaceX = targetX * width - particle.x;
      const toFaceY = targetY * height - particle.y;
      const faceDistance = Math.hypot(toFaceX, toFaceY) || 1;
      const pull = 26 * dt * levelFactor;
      particle.vx += toFaceX / faceDistance * pull;
      particle.vy += toFaceY / faceDistance * pull;
      particle.vx *= Math.max(0, 1 - 0.8 * dt);
      particle.vy *= Math.max(0, 1 - 0.8 * dt);
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.y < -height * 0.15 || particle.x < -width * 0.1 || particle.x > width * 1.1) reset(particle, false);
      const lifeRatio = particle.life / particle.maxLife;
      const fade = Math.min(1, lifeRatio / 0.18) * Math.pow(Math.sin(Math.PI * clamp(lifeRatio, 0, 1)), 0.7);
      const twinkle = 0.55 + 0.45 * Math.sin(particle.phase + time * 1.6);
      const finale = clamp((smoothLevel - 23) / 7, 0, 1);
      positions[index * 2] = particle.x;
      positions[index * 2 + 1] = particle.y;
      sizes[index] = particle.size * dpr * (0.8 + 0.4 * levelFactor) * (1 + 0.18 * finale);
      alphas[index] = clamp((0.3 + 0.42 * levelFactor) * (1 + 0.18 * finale) * twinkle * fade, 0, 1);
      colors[index * 3] = mix(0.74, 0.86, smoothDark);
      colors[index * 3 + 1] = mix(0.8, 0.68, smoothDark);
      colors[index * 3 + 2] = mix(0.92, 0.36, smoothDark);
      particle.phase += dt * 1.2;
    }
    pointerVX *= Math.max(0, 1 - dt * 8);
    pointerVY *= Math.max(0, 1 - dt * 8);
  };
  const render = () => {
    gpu.clearColor(0, 0, 0, 0);
    gpu.clear(gpu.COLOR_BUFFER_BIT);
    gpu.enable(gpu.BLEND);
    gpu.blendFunc(gpu.SRC_ALPHA, gpu.ONE);
    gpu.disable(gpu.DEPTH_TEST);
    const attributes = [
      [positions.subarray(0, active * 2), positionLocation, 2],
      [sizes.subarray(0, active), sizeLocation, 1],
      [alphas.subarray(0, active), alphaLocation, 1],
      [colors.subarray(0, active * 3), colorLocation, 3]
    ];
    attributes.forEach(([data, location, count], index) => {
      gpu.bindBuffer(gpu.ARRAY_BUFFER, buffers[index]);
      gpu.bufferData(gpu.ARRAY_BUFFER, data, gpu.DYNAMIC_DRAW);
      gpu.enableVertexAttribArray(location);
      gpu.vertexAttribPointer(location, count, gpu.FLOAT, false, 0, 0);
    });
    gpu.uniform1f(scaleLocation, 2.6);
    gpu.uniform1f(alphaLocationU, 0.2);
    gpu.drawArrays(gpu.POINTS, 0, active);
    gpu.uniform1f(scaleLocation, 1);
    gpu.uniform1f(alphaLocationU, 1);
    gpu.drawArrays(gpu.POINTS, 0, active);
    surface.clearRect(0, 0, canvas.width, canvas.height);
    surface.drawImage(gpuCanvas, 0, 0, canvas.width, canvas.height);
  };
  const canDraw = () => requested && !disposed && !doc.hidden && width > 0 && height > 0;
  const tick = (now) => {
    raf = null;
    if (!canDraw() || reduced) return;
    const dt = (last === 0 ? 16 : Math.min(48, Math.max(0, now - last))) / 1e3;
    last = now;
    time += dt;
    smoothLevel = mix(smoothLevel, level, 0.06);
    smoothDark = mix(smoothDark, dark ? 1 : 0, 0.05);
    try {
      simulate(dt);
      render();
    } catch {
      dispose();
      return;
    }
    if (canDraw() && !reduced) raf = view.requestAnimationFrame(tick);
  };
  const syncActivity = () => {
    if (!requested || disposed) return;
    try {
      resize();
    } catch {
      dispose();
      return;
    }
    if (!canDraw() || reduced) cancelFrame();
    if (!canDraw()) return;
    if (reduced) {
      smoothLevel = level;
      smoothDark = dark ? 1 : 0;
      try {
        simulate(0);
        render();
      } catch {
        dispose();
      }
    } else if (raf === null) raf = view.requestAnimationFrame(tick);
  };
  const onResize = () => syncActivity();
  const onVisibility = () => syncActivity();
  const onMotionChange = (event) => {
    reduced = event.matches;
    syncActivity();
  };
  const onPointerLeave = () => {
    pointerX = pointerY = -1e4;
    pointerVX = pointerVY = 0;
    pointerDown = false;
    lastPointer = 0;
  };
  const onPointerMove = (event) => {
    if (!canDraw() || reduced) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      onPointerLeave();
      return;
    }
    const now = view.performance.now();
    const dt = lastPointer === 0 ? 16 : Math.max(8, now - lastPointer);
    if (pointerX > -1e3) {
      pointerVX = (x * dpr - pointerX) / dt;
      pointerVY = (y * dpr - pointerY) / dt;
    }
    pointerX = x * dpr;
    pointerY = y * dpr;
    lastPointer = now;
  };
  const onPointerDown = () => {
    if (canDraw() && !reduced) pointerDown = true;
  };
  const onPointerUp = () => {
    pointerDown = false;
  };
  const onContextLost = (event) => {
    event.preventDefault();
    dispose();
  };
  const stop = () => {
    if (!requested) return;
    requested = false;
    cancelFrame();
    doc.removeEventListener("visibilitychange", onVisibility);
    view.removeEventListener("resize", onResize);
    view.removeEventListener("pointermove", onPointerMove);
    view.removeEventListener("pointerdown", onPointerDown);
    view.removeEventListener("pointerup", onPointerUp);
    view.removeEventListener("pointerleave", onPointerLeave);
    view.removeEventListener("blur", onPointerLeave);
    gpuCanvas.removeEventListener("webglcontextlost", onContextLost);
    if (query?.removeEventListener) query.removeEventListener("change", onMotionChange);
    else query?.removeListener(onMotionChange);
    observer?.disconnect();
    observer = null;
    onPointerLeave();
    release(clear);
  };
  const dispose = () => {
    if (disposed) return;
    stop();
    disposed = true;
    releaseGPU();
    particles.length = 0;
    canvas.width = canvas.height = 0;
  };
  const relativePoint = (x, y) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x: clamp((x - rect.left) / rect.width, 0, 1), y: clamp((y - rect.top) / rect.height, 0, 1) };
  };
  return {
    setLevel(nextLevel, nextDark) {
      if (disposed) return;
      level = Number.isFinite(nextLevel) ? clamp(nextLevel, 0, 30) : 0;
      dark = nextDark;
      if (requested && reduced) syncActivity();
    },
    setAnchor(x, y) {
      if (disposed) return;
      const point = relativePoint(x, y);
      if (point !== null) {
        anchorX = point.x;
        anchorY = point.y;
      }
    },
    setTarget(x, y) {
      if (disposed) return;
      const point = relativePoint(x, y);
      if (point !== null) {
        targetX = point.x;
        targetY = point.y;
      }
    },
    start() {
      if (requested || disposed) return;
      requested = true;
      reduced = query?.matches ?? false;
      try {
        resize();
      } catch {
        dispose();
        return;
      }
      smoothLevel = level;
      smoothDark = dark ? 1 : 0;
      for (let index = particles.length; index < MAX_PARTICLES; index += 1) {
        particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, phase: 0 });
      }
      for (const particle of particles) reset(particle, true);
      doc.addEventListener("visibilitychange", onVisibility);
      view.addEventListener("resize", onResize);
      view.addEventListener("pointermove", onPointerMove, { passive: true });
      view.addEventListener("pointerdown", onPointerDown, { passive: true });
      view.addEventListener("pointerup", onPointerUp, { passive: true });
      view.addEventListener("pointerleave", onPointerLeave, { passive: true });
      view.addEventListener("blur", onPointerLeave);
      gpuCanvas.addEventListener("webglcontextlost", onContextLost);
      if (query?.addEventListener) query.addEventListener("change", onMotionChange);
      else query?.addListener(onMotionChange);
      if (typeof view.ResizeObserver === "function") {
        observer = new view.ResizeObserver(onResize);
        observer.observe(canvas);
      }
      syncActivity();
    },
    stop,
    dispose
  };
}

// src/client/motion.ts
var PRESETS = {
  idle: { opacity: "0.32", scale: "0.9" },
  running: { opacity: "0.69", scale: "1" },
  preview: { opacity: "1", scale: "1" }
};
function createPortraitMotion(root) {
  const attributes = ["data-motion", "data-motion-state"];
  const properties = ["--liang-motion-opacity", "--liang-motion-scale"];
  const previousAttributes = attributes.map((name) => [name, root.getAttribute(name)]);
  const previousProperties = properties.map((name) => ({
    name,
    value: root.style.getPropertyValue(name),
    priority: root.style.getPropertyPriority(name)
  }));
  let running = false;
  let previewing = false;
  let disposed = false;
  const sync = () => {
    if (disposed) return;
    const state = previewing ? "preview" : running ? "running" : "idle";
    root.dataset.motion = "on";
    root.dataset.motionState = state;
    root.style.setProperty("--liang-motion-opacity", PRESETS[state].opacity);
    root.style.setProperty("--liang-motion-scale", PRESETS[state].scale);
  };
  sync();
  return {
    setRunning(next) {
      if (disposed || running === next) return;
      running = next;
      sync();
    },
    setPreviewing(next) {
      if (disposed || previewing === next) return;
      previewing = next;
      sync();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const [name, value] of previousAttributes) {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      }
      for (const { name, value, priority } of previousProperties) {
        if (value === "") root.style.removeProperty(name);
        else root.style.setProperty(name, value, priority);
      }
    }
  };
}

// src/client/preferences.ts
var PREFERENCE_STORAGE_KEY = "dsh-liang-intensity-skin.settings.v1";
var ENABLED_STORAGE_KEY = "dsh-liang-intensity-skin.enabled.v1";
var BIND_EFFORT_KEY = "dsh-liang-intensity-skin.bind-effort";
var MASK_KEY = "dsh-liang-intensity-skin.mask";
var DEFAULT_SKIN_SETTINGS = Object.freeze({
  enabled: true,
  bindEffort: true,
  maskEnabled: true,
  // Optional visual effects never enable one another or change reasoning.
  xianxiaPortraits: false,
  particlesEnabled: false,
  motionEnabled: false,
  fineStopsEnabled: false,
  hideSlider: false
});
var PERSISTENT_KEYS = [
  "bindEffort",
  "maskEnabled",
  "xianxiaPortraits",
  "particlesEnabled",
  "motionEnabled",
  "fineStopsEnabled",
  "hideSlider"
];
function persistentSettings(settings) {
  return Object.fromEntries(PERSISTENT_KEYS.map((key) => [key, settings[key]]));
}
function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
function read(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function readEnabled(storage) {
  return read(storage, ENABLED_STORAGE_KEY) !== "0";
}
function parse(raw) {
  if (raw === null) return null;
  try {
    const record = JSON.parse(raw);
    if (record === null || typeof record !== "object" || !("version" in record) || record.version !== 1 || !("values" in record) || record.values === null || typeof record.values !== "object") return null;
    const values = record.values;
    const result = persistentSettings(DEFAULT_SKIN_SETTINGS);
    for (const key of PERSISTENT_KEYS) {
      if (typeof values[key] === "boolean") result[key] = values[key];
    }
    return result;
  } catch {
    return null;
  }
}
function load(storage) {
  const versioned = parse(read(storage, PREFERENCE_STORAGE_KEY));
  return {
    versioned: versioned !== null,
    values: versioned ?? {
      ...persistentSettings(DEFAULT_SKIN_SETTINGS),
      bindEffort: read(storage, BIND_EFFORT_KEY) !== "0",
      maskEnabled: read(storage, MASK_KEY) !== "0"
    }
  };
}
function createPreferenceStore() {
  const storage = getStorage();
  const initial = load(storage);
  let hasVersioned = initial.versioned;
  let snapshot = { enabled: readEnabled(storage), ...initial.values };
  let disposed = false;
  const listeners = /* @__PURE__ */ new Set();
  const apply2 = (values) => {
    if (disposed || Object.entries(values).every(([key, value]) => snapshot[key] === value)) return;
    snapshot = { ...snapshot, ...values };
    for (const listener of listeners) listener();
  };
  const onStorage = (event) => {
    if (disposed || event.storageArea != null && event.storageArea !== storage) return;
    if (event.key === ENABLED_STORAGE_KEY) {
      apply2({ enabled: event.newValue !== "0" });
    } else if (event.key === PREFERENCE_STORAGE_KEY) {
      const next = parse(event.newValue);
      const fallback = next === null ? load(storage) : null;
      hasVersioned = next !== null || fallback?.versioned === true;
      apply2(next ?? fallback.values);
    } else if (event.key === null) {
      const next = load(storage);
      hasVersioned = next.versioned;
      apply2({ enabled: readEnabled(storage), ...next.values });
    } else if (!hasVersioned && (event.key === BIND_EFFORT_KEY || event.key === MASK_KEY)) {
      const current = load(storage);
      if (current.versioned) {
        hasVersioned = true;
        apply2(current.values);
      } else {
        apply2({ [event.key === BIND_EFFORT_KEY ? "bindEffort" : "maskEnabled"]: event.newValue !== "0" });
      }
    }
  };
  const target = typeof window === "undefined" ? null : window;
  target?.addEventListener("storage", onStorage);
  const update = async (patch) => {
    if (disposed) return;
    for (const [key, value] of Object.entries(patch)) {
      if (!PERSISTENT_KEYS.includes(key) || typeof value !== "boolean") {
        throw new TypeError("Invalid Liang setting");
      }
    }
    const values = { ...persistentSettings(snapshot), ...patch };
    if (PERSISTENT_KEYS.every((key) => values[key] === snapshot[key])) return;
    if (storage === null) throw new Error("Local settings storage is unavailable");
    storage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify({ version: 1, values }));
    hasVersioned = true;
    apply2(values);
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (disposed) return () => {
      };
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async set(enabled) {
      if (disposed || snapshot.enabled === enabled) return;
      if (storage === null) throw new Error("Local settings storage is unavailable");
      storage.setItem(ENABLED_STORAGE_KEY, enabled ? "1" : "0");
      apply2({ enabled });
    },
    setBindEffort: (bindEffort) => update({ bindEffort }),
    setMaskEnabled: (maskEnabled) => update({ maskEnabled }),
    setOption: (key, value) => update({ [key]: value }),
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      target?.removeEventListener("storage", onStorage);
      listeners.clear();
    }
  };
}

// src/client/settings-panel.tsx
var import_react2 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/settings-panel.css
var settings_panel_default = ".liang-settings-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  color: var(--dsw-alias-label-primary);\n}\n\n.liang-settings-panel__group {\n  min-width: 0;\n}\n\n.liang-settings-panel__heading {\n  margin: 0 0 8px;\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 22px;\n}\n\n.liang-settings-panel__row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 24px;\n  min-height: 60px;\n  padding: 10px 0;\n  border-bottom: .5px solid var(--dsw-alias-border-l2);\n}\n\n.liang-settings-panel__row:last-child {\n  border-bottom: 0;\n}\n\n.liang-settings-panel__master {\n  padding-bottom: 16px;\n}\n\n.liang-settings-panel__copy {\n  min-width: 0;\n}\n\n.liang-settings-panel__label {\n  font-size: 14px;\n  line-height: 22px;\n}\n\n.liang-settings-panel__description,\n.liang-settings-panel__error {\n  margin: 4px 0 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.liang-settings-panel__error {\n  color: var(--dsw-alias-state-error-primary);\n}\n\n.liang-settings-page {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  min-width: 0;\n}\n\n.liang-settings-page__title {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 600;\n  line-height: 26px;\n}\n";

// src/client/update-controls.tsx
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/update-controls.css
var update_controls_default = ".liang-update-controls {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  min-width: 0;\n}\n\n.liang-update-controls__row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: 8px 16px;\n}\n\n.liang-update-controls__version {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  line-height: 22px;\n  overflow-wrap: anywhere;\n}\n\n.liang-update-controls__actions {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n\n.liang-update-controls__detail,\n.liang-update-controls__message {\n  margin: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  overflow-wrap: anywhere;\n}\n\n.liang-update-controls__error {\n  color: var(--dsw-alias-state-error-primary);\n}\n";

// src/client/update-controls.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var UPDATE_LOCALES = {
  zh: {
    "update.loadedVersion": "\u5F53\u524D\u8FD0\u884C\u7248\u672C {version}",
    "update.installedVersion": "\u5DF2\u5B89\u88C5\u7248\u672C {version}\uFF0C\u4E0E\u5F53\u524D\u8FD0\u884C\u7248\u672C\u4E0D\u540C\u3002",
    "update.check": "\u68C0\u67E5\u66F4\u65B0",
    "update.verify": "\u6838\u5BF9\u66F4\u65B0\u72B6\u6001",
    "update.checking": "\u6B63\u5728\u68C0\u67E5\u2026",
    "update.install": "\u66F4\u65B0\u5230 {version}",
    "update.installing": "\u6B63\u5728\u66F4\u65B0\u2026",
    "update.status.checking": "\u6B63\u5728\u68C0\u67E5\u66F4\u65B0\u3002",
    "update.status.available": "\u53D1\u73B0\u65B0\u7248\u672C {version}\u3002",
    "update.status.current": "\u5F53\u524D\u65E0\u9700\u66F4\u65B0\u3002",
    "update.status.installing": "\u6B63\u5728\u5B89\u88C5\u66F4\u65B0\uFF0C\u8BF7\u7A0D\u5019\u3002",
    "update.status.applied": "\u5DF2\u5B89\u88C5\u66F4\u65B0\u3002",
    "update.status.restart": "\u5DF2\u5B89\u88C5\u66F4\u65B0\uFF0C\u8BF7\u91CD\u542F DSH \u4EE5\u52A0\u8F7D\u65B0\u7248\u672C\u3002",
    "update.status.overridden": "\u5F53\u524D\u76AE\u80A4\u5B58\u5728\u5176\u4ED6\u5B89\u88C5\u6765\u6E90\uFF0C\u8BF7\u5230\u76AE\u80A4\u5E02\u573A\u6838\u5BF9\u3002",
    "update.status.cancelled": "\u66F4\u65B0\u5DF2\u53D6\u6D88\u3002",
    "update.status.failed": "\u68C0\u67E5\u6216\u66F4\u65B0\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u3002",
    "update.status.unknown": "\u6682\u65F6\u65E0\u6CD5\u786E\u8BA4\u66F4\u65B0\u7ED3\u679C\uFF0C\u8BF7\u5148\u6838\u5BF9\u66F4\u65B0\u72B6\u6001\u3002",
    "update.checkFailed": "\u68C0\u67E5\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",
    "update.market": "\u53EF\u5230\u76AE\u80A4\u5E02\u573A\u66F4\u65B0\u3002"
  },
  en: {
    "update.loadedVersion": "Running version {version}",
    "update.installedVersion": "Installed version {version} differs from the running version.",
    "update.check": "Check for updates",
    "update.verify": "Verify update status",
    "update.checking": "Checking\u2026",
    "update.install": "Update to {version}",
    "update.installing": "Updating\u2026",
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
    "update.market": "You can update through the skin market."
  }
};
function UpdateControls({ updater, t }) {
  const snapshot = (0, import_react.useSyncExternalStore)(
    (listener) => updater.subscribe(listener),
    () => updater.getSnapshot(),
    () => updater.getSnapshot()
  );
  const [action, setAction] = (0, import_react.useState)(null);
  const [checkFailed, setCheckFailed] = (0, import_react.useState)(false);
  const [verificationRequired, setVerificationRequired] = (0, import_react.useState)(false);
  const inFlight = (0, import_react.useRef)(false);
  const mustVerify = (0, import_react.useRef)(false);
  const mounted = (0, import_react.useRef)(true);
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const text = (key, version) => t(key).replace("{version}", version);
  const unknown = verificationRequired || snapshot.phase === "unknown";
  const busy = snapshot.busy || action !== null;
  const installing = snapshot.phase === "installing" || action === "install";
  const checking = snapshot.phase === "checking" || action === "check";
  const canInstall = snapshot.phase === "available" && snapshot.canInstall && snapshot.targetVersion !== null && !unknown;
  const run = async (next) => {
    const current = updater.getSnapshot();
    if (inFlight.current || current.busy || !mounted.current) return;
    if (next === "install" && (mustVerify.current || current.phase !== "available" || !current.canInstall || current.targetVersion === null)) return;
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
  const marketHint = !busy && (snapshot.phase === "failed" || snapshot.phase === "overridden" || !snapshot.managerAvailable && snapshot.phase === "available");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "liang-update-controls", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "liang-update-controls__row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "liang-update-controls__version", children: text("update.loadedVersion", snapshot.loadedVersion) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "liang-update-controls__actions", "aria-busy": busy, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { type: "button", disabled: busy, onClick: () => {
          void run("check");
        }, children: t(checking ? "update.checking" : unknown ? "update.verify" : "update.check") }),
        (canInstall || installing) && snapshot.targetVersion !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { type: "button", disabled: busy || !canInstall, onClick: () => {
          void run("install");
        }, children: installing ? t("update.installing") : text("update.install", snapshot.targetVersion) })
      ] })
    ] }),
    snapshot.installedVersion !== null && snapshot.installedVersion !== snapshot.loadedVersion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "liang-update-controls__detail", children: text("update.installedVersion", snapshot.installedVersion) }),
    message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "p",
      {
        className: `liang-update-controls__message${alert ? " liang-update-controls__error" : ""}`,
        role: alert ? "alert" : "status",
        "aria-live": alert ? "assertive" : "polite",
        "aria-atomic": "true",
        children: message
      }
    ),
    marketHint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "liang-update-controls__detail", children: t("update.market") })
  ] });
}

// src/client/settings-panel.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var SETTINGS_LOCALES = {
  zh: {
    "settings.title": "\u6ED1\u52A8\u53D8\u7956",
    "settings.enabled": "\u542F\u7528\u6ED1\u52A8\u53D8\u7956",
    "settings.enabled.description": "\u5173\u95ED\u540E\u6062\u590D\u539F\u751F\u5916\u89C2\uFF0C\u4FDD\u7559\u5176\u4ED6\u8BBE\u7F6E\u3002",
    "settings.group.slider": "\u6ED1\u5757",
    "settings.group.visual": "\u5916\u89C2",
    "settings.bindEffort": "\u7ED1\u5B9A\u601D\u8003\u7B49\u7EA7",
    "settings.bindEffort.description": "\u62D6\u52A8\u6ED1\u5757\u65F6\u540C\u6B65\u4FEE\u6539\u6A21\u578B\u7684\u63A8\u7406\u6863\u4F4D\u3002\u5173\u95ED\u540E\u53EA\u6539\u53D8\u5916\u89C2\u3002",
    "settings.fineStopsEnabled": "31 \u6863\u7EC6\u5206",
    "settings.fineStopsEnabled.description": "\u5916\u89C2\u53EF\u505C\u5728 0\u201330 \u7684\u6BCF\u4E00\u7EA7\uFF1B\u6A21\u578B\u4ECD\u4F7F\u7528\u6700\u8FD1\u7684\u771F\u5B9E\u63A8\u7406\u6863\u4F4D\u3002",
    "settings.hideSlider": "\u9690\u85CF\u6ED1\u5757",
    "settings.hideSlider.description": "\u9690\u85CF\u8F93\u5165\u6846\u65C1\u7684\u6ED1\u5757\uFF1B\u7ED1\u5B9A\u5F00\u542F\u65F6\uFF0C\u5916\u89C2\u4ECD\u968F\u6A21\u578B\u63A8\u7406\u6863\u4F4D\u53D8\u5316\u3002",
    "settings.maskEnabled": "\u80CC\u666F\u906E\u7F69",
    "settings.maskEnabled.description": "\u964D\u4F4E\u4EBA\u7269\u80CC\u666F\u7684\u89C6\u89C9\u5E72\u6270\uFF0C\u4FDD\u6301\u5BF9\u8BDD\u6E05\u6670\u3002",
    "settings.xianxiaPortraits": "\u4ED9\u4FA0\u98CE",
    "settings.xianxiaPortraits.description": "\u5207\u6362\u4E3A\u4ED9\u4FA0\u98CE\u683C\u4EBA\u7269\uFF1B\u4E0D\u6539\u53D8\u5176\u4ED6\u6548\u679C\u6216\u63A8\u7406\u7B49\u7EA7\u3002",
    "settings.particlesEnabled": "\u7C92\u5B50\u6548\u679C",
    "settings.particlesEnabled.description": "\u5728\u4EBA\u7269\u80CC\u666F\u4E0A\u663E\u793A\u88C5\u9970\u7C92\u5B50\u3002",
    "settings.motionEnabled": "\u7A7A\u95F2\u65F6\u6DE1\u5316",
    "settings.motionEnabled.description": "\u8FD0\u884C\u6216\u62D6\u52A8\u65F6\u7A81\u51FA\u4EBA\u7269\uFF0C\u7A7A\u95F2\u65F6\u81EA\u52A8\u6DE1\u5316\u3002",
    "settings.failed": "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BBE\u7F6E\u672A\u66F4\u6539\u3002\u8BF7\u91CD\u8BD5\u3002"
  },
  en: {
    "settings.title": "Liang Skin",
    "settings.enabled": "Enable Liang Skin",
    "settings.enabled.description": "Turn off to restore the native appearance and keep your other settings.",
    "settings.group.slider": "Slider",
    "settings.group.visual": "Appearance",
    "settings.bindEffort": "Bind reasoning level",
    "settings.bindEffort.description": "Update the model\u2019s reasoning effort with the slider. Turn off to change appearance only.",
    "settings.fineStopsEnabled": "31 fine stops",
    "settings.fineStopsEnabled.description": "Stop at every visual level from 0\u201330. The model still uses the nearest actual effort.",
    "settings.hideSlider": "Hide slider",
    "settings.hideSlider.description": "Hide the slider next to the composer. While binding is on, appearance still follows the model\u2019s reasoning effort.",
    "settings.maskEnabled": "Background scrim",
    "settings.maskEnabled.description": "Soften the portrait background to keep conversations readable.",
    "settings.xianxiaPortraits": "Xianxia style",
    "settings.xianxiaPortraits.description": "Use fantasy portraits without changing other effects or reasoning effort.",
    "settings.particlesEnabled": "Particle effects",
    "settings.particlesEnabled.description": "Show decorative particles over the portrait background.",
    "settings.motionEnabled": "Fade while idle",
    "settings.motionEnabled.description": "Bring portraits forward while running or dragging, and fade them while idle.",
    "settings.failed": "Could not save. Settings have not changed. Please try again."
  }
};
var GROUPS = [
  { title: "settings.group.slider", keys: ["bindEffort", "fineStopsEnabled", "hideSlider"] },
  { title: "settings.group.visual", keys: ["maskEnabled", "xianxiaPortraits", "particlesEnabled", "motionEnabled"] }
];
function SettingsPanel({ scope, updater, t }) {
  const snapshot = (0, import_react2.useSyncExternalStore)((listener) => scope.subscribe(listener), () => scope.getSnapshot());
  const [pending, setPending] = (0, import_react2.useState)(false);
  const [failed, setFailed] = (0, import_react2.useState)(false);
  const busy = (0, import_react2.useRef)(false);
  const mounted = (0, import_react2.useRef)(true);
  (0, import_react2.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const change = async (key, value) => {
    if (busy.current || !mounted.current) return;
    busy.current = true;
    setPending(true);
    setFailed(false);
    try {
      if (key === "enabled") await scope.set(value);
      else await scope.update({ [key]: value });
    } catch {
      if (mounted.current) setFailed(true);
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-settings-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-settings-panel__row liang-settings-panel__master", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-settings-panel__copy", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "liang-settings-panel__label", children: t("settings.enabled") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "liang-settings-panel__description", children: t("settings.enabled.description") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_dsh_client_ui_primitives2.Switch,
        {
          checked: snapshot.enabled,
          disabled: pending,
          label: t("settings.enabled"),
          onChange: (value) => {
            void change("enabled", value);
          }
        }
      )
    ] }),
    updater && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UpdateControls, { updater, t }),
    GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "liang-settings-panel__group", "aria-label": t(group.title), children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "liang-settings-panel__heading", children: t(group.title) }),
      group.keys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-settings-panel__row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-settings-panel__copy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "liang-settings-panel__label", children: t(`settings.${key}`) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "liang-settings-panel__description", children: t(`settings.${key}.description`) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_dsh_client_ui_primitives2.Switch,
          {
            checked: snapshot[key],
            disabled: pending,
            label: t(`settings.${key}`),
            onChange: (value) => {
              void change(key, value);
            }
          }
        )
      ] }, key))
    ] }, group.title)),
    failed && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "liang-settings-panel__error", role: "alert", children: t("settings.failed") })
  ] });
}

// src/client/effort-sync.ts
function createEffortSync() {
  let observed = null;
  let submitted = null;
  return {
    submit(key, from, mode) {
      submitted = { key, from, mode };
    },
    reset() {
      submitted = null;
    },
    observe(next) {
      const changedMode = observed?.mode !== next.mode;
      if (changedMode) submitted = null;
      if (next.fine && submitted?.mode === next.mode) {
        if (submitted.key === next.key) {
          submitted = null;
          observed = next;
          return null;
        }
        if (submitted.from === next.key && observed?.key === next.key) return null;
        submitted = null;
      }
      const changed = changedMode || observed?.key !== next.key;
      observed = next;
      return !next.fine || changed ? next.frame : null;
    }
  };
}

// src/client/updater.ts
var SKIN_PACKAGE = "@leon___/dsh-client-liang-intensity-skin";
var SKIN_LATEST_URL = `https://registry.npmjs.org/${encodeURIComponent(SKIN_PACKAGE)}/latest`;
var object = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
function versionParts(version) {
  if (version.length > 256) throw new Error("Invalid semantic version");
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(version);
  if (match === null) throw new Error("Invalid semantic version");
  const prerelease = match[4]?.split(".") ?? [];
  if (prerelease.some((part) => /^\d+$/.test(part) && part.length > 1 && part.startsWith("0"))) {
    throw new Error("Invalid semantic version");
  }
  return { core: match.slice(1, 4), prerelease };
}
var numericCompare = (left, right) => left.length !== right.length ? Math.sign(left.length - right.length) : left === right ? 0 : left < right ? -1 : 1;
function compareSkinVersions(left, right) {
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
    if (x === void 0 || y === void 0) return x === void 0 ? -1 : 1;
    if (x === y) continue;
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    return xn && yn ? numericCompare(x, y) : xn !== yn ? xn ? -1 : 1 : x < y ? -1 : 1;
  }
  return 0;
}
function unwrap(value) {
  const result = object(value);
  if (result?.ok === false) throw new Error("Remote request failed");
  return result?.ok === true ? result.value : value;
}
function bounded(work) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Read timed out")), 1e4);
    work.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }, (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
async function readBundle(manager) {
  const values = unwrap(await bounded(manager.listBundles()));
  if (!Array.isArray(values)) throw new Error("Invalid bundle inventory");
  const matches = values.filter((value2) => object(value2)?.name === SKIN_PACKAGE);
  if (matches.length === 0) return null;
  const value = object(matches[0]);
  if (matches.length !== 1 || typeof value.version !== "string" || typeof value.enabled !== "boolean" || typeof value.installed !== "boolean" || typeof value.optional !== "boolean" || !Array.isArray(value.rows) || !Array.isArray(value.overrides) || value.overrides.some((item) => typeof item !== "string") || value.source !== void 0 && typeof value.source !== "string") throw new Error("Invalid bundle inventory");
  versionParts(value.version);
  const rows = value.rows.map((row) => {
    const item = object(row);
    if (typeof item?.rowId !== "string" || typeof item.moduleName !== "string") throw new Error("Invalid bundle row");
    return [item.rowId, item.moduleName];
  });
  const identity = JSON.stringify([
    value.version,
    value.enabled,
    value.installed,
    value.optional,
    value.source ?? null,
    value.availability ?? null,
    value.official ?? null,
    value.readOnlyReason ?? null,
    object(value.error)?.code ?? null,
    rows,
    value.overrides
  ]);
  return {
    version: value.version,
    enabled: value.enabled,
    identity,
    installable: value.installed && value.readOnlyReason === void 0 && value.error === void 0 && value.availability !== "missing"
  };
}
var UNKNOWN = "\u66F4\u65B0\u7ED3\u679C\u5C1A\u672A\u786E\u8BA4\u3002\u8BF7\u5148\u6838\u5BF9\u66F4\u65B0\u72B6\u6001\uFF0C\u671F\u95F4\u4E0D\u4F1A\u91CD\u590D\u5B89\u88C5\u3002";
var MANAGER_MISSING = "\u5F53\u524D\u5BBF\u4E3B\u672A\u63D0\u4F9B\u53EF\u7528\u7684\u66F4\u65B0\u63A5\u53E3\uFF0C\u8BF7\u901A\u8FC7\u76AE\u80A4\u5E02\u573A\u66F4\u65B0\u3002";
var refusal = (code) => code === "already-installed" ? "\u5F53\u524D\u5BBF\u4E3B\u4E0D\u5141\u8BB8\u8986\u76D6\u5DF2\u5B89\u88C5\u7684\u76AE\u80A4\uFF0C\u8BF7\u6539\u7528\u76AE\u80A4\u5E02\u573A\u66F4\u65B0\u3002" : code === "incompatible-version" ? "\u5BBF\u4E3B\u62D2\u7EDD\u4E86\u4E0D\u517C\u5BB9\u7684\u66F4\u65B0\uFF0C\u8BF7\u6838\u5BF9 DSH \u4E0E\u76AE\u80A4\u7248\u672C\u3002" : code === "stop-profile" || code === "bundle-in-use" ? "\u5BBF\u4E3B\u8981\u6C42\u5148\u505C\u6B62\u6B63\u5728\u4F7F\u7528\u7684\u63D2\u4EF6\uFF0C\u8BF7\u901A\u8FC7\u76AE\u80A4\u5E02\u573A\u6216\u63D2\u4EF6\u7BA1\u7406\u5668\u5904\u7406\u3002" : code === "management-required" || code === "not-removable" ? "\u5BBF\u4E3B\u4E0D\u5141\u8BB8\u4FEE\u6539\u6B64\u63D2\u4EF6\uFF0C\u8BF7\u5728\u63D2\u4EF6\u7BA1\u7406\u5668\u67E5\u770B\u3002" : "\u5BBF\u4E3B\u672A\u80FD\u5B8C\u6210\u66F4\u65B0\uFF0C\u8BF7\u5728\u76AE\u80A4\u5E02\u573A\u6216\u63D2\u4EF6\u7BA1\u7406\u5668\u67E5\u770B\u539F\u56E0\u3002";
function createSkinUpdater(options) {
  versionParts(options.loadedVersion);
  const getManager = () => {
    try {
      const value = typeof options.manager === "function" ? options.manager() : options.manager;
      return typeof value?.listBundles === "function" && typeof value.installBundle === "function" ? value : void 0;
    } catch {
      return void 0;
    }
  };
  let snapshot = Object.freeze({
    phase: "idle",
    loadedVersion: options.loadedVersion,
    installedVersion: null,
    latestVersion: null,
    targetVersion: null,
    spec: null,
    canInstall: false,
    busy: false,
    error: null,
    managerAvailable: getManager() !== void 0
  });
  let target = null;
  let uncertain = null;
  let busy = false;
  let disposed = false;
  let checkAbort = null;
  const listeners = /* @__PURE__ */ new Set();
  const publish = (patch) => {
    if (disposed) return;
    snapshot = Object.freeze({ ...snapshot, ...patch });
    for (const listener of [...listeners]) {
      try {
        listener();
      } catch {
      }
    }
  };
  const newest = (bundle) => bundle !== null && compareSkinVersions(bundle.version, options.loadedVersion) > 0 ? bundle.version : options.loadedVersion;
  const markUnknown = (checked) => {
    uncertain = { target: checked };
    publish({ phase: "unknown", canInstall: false, busy: false, error: UNKNOWN });
  };
  const check = async () => {
    if (disposed || busy) return;
    busy = true;
    target = null;
    const manager = getManager();
    publish({ phase: "checking", busy: true, canInstall: false, error: null, managerAvailable: manager !== void 0 });
    const controller = new AbortController();
    checkAbort = controller;
    const timer = setTimeout(() => controller.abort(), 1e4);
    try {
      const [release, bundle] = await Promise.all([
        bounded((async () => {
          const response = await (options.fetchLatest ?? fetch)(SKIN_LATEST_URL, {
            credentials: "omit",
            referrerPolicy: "no-referrer",
            redirect: "error",
            cache: "no-store",
            headers: { accept: "application/json" },
            signal: controller.signal
          });
          if (!response.ok) throw new Error("Metadata request failed");
          return object(await response.json());
        })()),
        manager === void 0 ? Promise.resolve(null) : readBundle(manager)
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
        publish({ phase: "unknown", busy: false, canInstall: false, error: UNKNOWN });
        return;
      }
      const available = compareSkinVersions(release.version, newest(bundle)) > 0;
      const installable = available && manager !== void 0 && bundle?.installable === true;
      if (installable) target = Object.freeze({ version: release.version, spec: `${SKIN_PACKAGE}@${release.version}`, before: bundle });
      publish({
        phase: available ? "available" : bundle !== null && compareSkinVersions(bundle.version, options.loadedVersion) > 0 ? "restart-required" : "current",
        targetVersion: available ? release.version : null,
        spec: available ? `${SKIN_PACKAGE}@${release.version}` : null,
        canInstall: installable,
        busy: false,
        error: manager === void 0 ? MANAGER_MISSING : available && !installable ? "\u672A\u80FD\u786E\u8BA4\u5F53\u524D\u76AE\u80A4\u53EF\u66F4\u65B0\uFF0C\u8BF7\u5728\u63D2\u4EF6\u7BA1\u7406\u5668\u6838\u5BF9\u5B89\u88C5\u72B6\u6001\u3002" : null
      });
    } catch {
      publish({
        phase: uncertain === null ? "failed" : "unknown",
        busy: false,
        canInstall: false,
        error: uncertain === null ? "\u68C0\u67E5\u66F4\u65B0\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : UNKNOWN
      });
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
    publish({ phase: "installing", busy: true, canInstall: false, error: null, managerAvailable: manager !== void 0 });
    let dispatched = false;
    try {
      if (manager === void 0) {
        publish({ phase: "failed", busy: false, error: MANAGER_MISSING });
        return;
      }
      const before = await readBundle(manager);
      if (disposed) return;
      if (before === null || !before.installable || before.identity !== checked.before.identity) {
        publish({ phase: "failed", busy: false, installedVersion: before?.version ?? null, error: "\u76AE\u80A4\u5B89\u88C5\u72B6\u6001\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u66F4\u65B0\u3002" });
        return;
      }
      if (compareSkinVersions(checked.version, newest(before)) <= 0) {
        publish({ phase: "current", busy: false, installedVersion: before.version, targetVersion: null, spec: null });
        return;
      }
      const requestId = crypto.randomUUID();
      let outcome;
      dispatched = true;
      try {
        outcome = unwrap(await manager.installBundle(checked.spec, { enabled: before.enabled, requestId }));
      } catch {
        if (disposed) return;
        if (typeof manager.waitForInstall !== "function") {
          markUnknown(checked);
          return;
        }
        try {
          outcome = unwrap(await bounded(manager.waitForInstall(requestId)));
          if (outcome === null) {
            markUnknown(checked);
            return;
          }
        } catch {
          markUnknown(checked);
          return;
        }
      }
      if (disposed) return;
      const result = object(outcome);
      const application = result?.application;
      if (typeof result?.changed !== "boolean" || !["install", "enable"].includes(String(result.stage)) || result.target !== SKIN_PACKAGE && result.target !== checked.spec || !["applied", "restart-required", "overridden", "failed", "cancelled"].includes(String(application))) {
        markUnknown(checked);
        return;
      }
      if (application === "failed") {
        publish({ phase: "failed", busy: false, error: refusal(object(result.error)?.code) });
        return;
      }
      if (application === "cancelled") {
        publish({ phase: "cancelled", busy: false, error: "\u66F4\u65B0\u5DF2\u53D6\u6D88\u3002" });
        return;
      }
      if (result.bundle !== SKIN_PACKAGE || result.version !== void 0 && result.version !== checked.version) {
        markUnknown(checked);
        return;
      }
      let installed;
      try {
        installed = await readBundle(manager);
      } catch {
        markUnknown(checked);
        return;
      }
      if (disposed) return;
      if (installed?.version !== checked.version) {
        markUnknown(checked);
        return;
      }
      publish({
        phase: application,
        busy: false,
        installedVersion: installed.version,
        canInstall: false,
        error: application === "overridden" ? "\u66F4\u65B0\u5305\u5DF2\u5B89\u88C5\uFF0C\u4F46\u542F\u7528\u72B6\u6001\u88AB\u5176\u4ED6\u914D\u7F6E\u8986\u76D6\uFF0C\u8BF7\u5728\u63D2\u4EF6\u7BA1\u7406\u5668\u6838\u5BF9\u3002" : null
      });
    } catch {
      if (dispatched) markUnknown(checked);
      else publish({ phase: "failed", busy: false, canInstall: false, error: "\u65E0\u6CD5\u6838\u5BF9\u5F53\u524D\u5B89\u88C5\u72B6\u6001\uFF0C\u8BF7\u91CD\u65B0\u68C0\u67E5\u66F4\u65B0\u3002" });
    } finally {
      busy = false;
    }
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (disposed) return () => {
      };
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    check,
    install,
    dispose() {
      if (disposed) return;
      disposed = true;
      checkAbort?.abort();
      listeners.clear();
    }
  };
}

// src/client/portrait-loader.ts
var RETRY_DELAYS = [500, 1500, 3e3];
function retryUrl(source, retry) {
  if (retry === 0) return source;
  const hashIndex = source.indexOf("#");
  const hash = hashIndex < 0 ? "" : source.slice(hashIndex);
  const base = hashIndex < 0 ? source : source.slice(0, hashIndex);
  const queryIndex = base.indexOf("?");
  const path = queryIndex < 0 ? base : base.slice(0, queryIndex);
  const query = new URLSearchParams(queryIndex < 0 ? "" : base.slice(queryIndex + 1));
  query.set("retry", String(retry));
  return `${path}?${query}${hash}`;
}
function createPortraitLoader(options) {
  const sources = options.sources.map((source) => ({ ...source }));
  const assets = /* @__PURE__ */ new Map();
  for (const { url } of sources) {
    if (!assets.has(url)) {
      assets.set(url, {
        url,
        status: "idle",
        loadedUrl: null,
        retries: 0,
        image: null,
        timer: null,
        detach: null
      });
    }
  }
  const createImage = options.createImage ?? (() => new Image());
  let onChange = options.onChange;
  let active = false;
  let disposed = false;
  let generation = 0;
  let targetLevel = sources[0]?.level ?? 0;
  let displayedIndex = null;
  let lastState = null;
  const isCurrent = (run) => active && !disposed && generation === run;
  const nearestIndex = (available) => {
    let nearest = null;
    for (let index = 0; index < sources.length; index += 1) {
      if (!available(index)) continue;
      const distance = Math.abs(sources[index].level - targetLevel);
      const previous = nearest === null ? Infinity : Math.abs(sources[nearest].level - targetLevel);
      if (nearest === null || distance < previous || distance === previous && sources[index].level > sources[nearest].level) {
        nearest = index;
      }
    }
    return nearest;
  };
  const isReady = (index) => assets.get(sources[index].url)?.status === "ready";
  const emit = (state) => {
    if (lastState?.index === state.index && lastState.url === state.url && lastState.status === state.status) return;
    lastState = state;
    onChange?.(state);
  };
  const reconcile = () => {
    if (!active || disposed) return;
    const target = nearestIndex(() => true);
    if (target !== null && isReady(target)) displayedIndex = target;
    else if (displayedIndex === null) displayedIndex = nearestIndex(isReady);
    if (displayedIndex !== null) {
      const asset = assets.get(sources[displayedIndex].url);
      emit({ index: displayedIndex, url: asset.loadedUrl, image: asset.image, status: "ready" });
    } else {
      const exhausted = [...assets.values()].every((asset) => asset.status === "failed");
      emit({ index: null, url: null, image: null, status: exhausted ? "failed" : "loading" });
    }
  };
  const request = (asset, run) => {
    if (!isCurrent(run)) return;
    asset.status = "loading";
    const image = createImage();
    asset.image = image;
    image.loading = "eager";
    image.decoding = "async";
    const url = retryUrl(asset.url, asset.retries);
    let settled = false;
    let decoding = false;
    const current = () => !settled && isCurrent(run) && asset.image === image;
    const detach = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      asset.detach = null;
    };
    const handleError = () => {
      if (!current()) return;
      settled = true;
      detach();
      image.removeAttribute("src");
      asset.image = null;
      if (asset.retries < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[asset.retries];
        asset.retries += 1;
        asset.timer = setTimeout(() => {
          if (!isCurrent(run)) return;
          asset.timer = null;
          request(asset, run);
        }, delay);
      } else {
        asset.status = "failed";
        reconcile();
      }
    };
    const handleLoad = () => {
      if (!current() || decoding) return;
      decoding = true;
      void image.decode().then(() => {
        if (!current()) return;
        settled = true;
        detach();
        asset.loadedUrl = url;
        asset.status = "ready";
        reconcile();
      }, handleError);
    };
    asset.detach = detach;
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    image.src = url;
  };
  const stop = () => {
    active = false;
    generation += 1;
    for (const asset of assets.values()) {
      if (asset.timer !== null) clearTimeout(asset.timer);
      asset.timer = null;
      asset.detach?.();
      asset.image?.removeAttribute("src");
      asset.image = null;
      asset.status = "idle";
      asset.loadedUrl = null;
      asset.retries = 0;
    }
    displayedIndex = null;
    lastState = null;
  };
  return {
    start() {
      if (disposed || active) return;
      active = true;
      const run = ++generation;
      reconcile();
      for (const asset of assets.values()) request(asset, run);
    },
    select(level) {
      if (disposed || !Number.isFinite(level)) return;
      targetLevel = level;
      reconcile();
    },
    stop,
    dispose() {
      stop();
      disposed = true;
      onChange = null;
    }
  };
}

// src/client/logic.ts
var PREVIEW_MAX_FRAME = 240;
var MAX_LEVEL = 30;
function frameForLevel(level) {
  return clampFrame(Math.max(0, Math.min(MAX_LEVEL, level)) / MAX_LEVEL * PREVIEW_MAX_FRAME);
}
function levelForFrame(frame) {
  return Math.round(clampFrame(frame) / PREVIEW_MAX_FRAME * MAX_LEVEL);
}
function snapFrame(frame) {
  return frameForLevel(levelForFrame(frame));
}
var LIANG_RANKS = ["\u5C0F\u96BE\u6881", "\u7262\u6881", "\u6881\u5B50", "\u6881\u5723", "\u6881\u795E", "\u6881\u7956"];
var STOPS = [
  { at: 0, page: [232, 233, 229], surface: [248, 248, 245], surface2: [238, 239, 235], ink: [23, 24, 22], secondary: [112, 116, 111], accent: [181, 43, 36], portraitOpacity: 1 },
  { at: 6, page: [211, 211, 206], surface: [239, 239, 234], surface2: [224, 224, 218], ink: [26, 26, 24], secondary: [101, 101, 96], accent: [181, 43, 36], portraitOpacity: 1 },
  { at: 12, page: [171, 168, 162], surface: [211, 208, 201], surface2: [190, 186, 179], ink: [27, 26, 24], secondary: [83, 79, 74], accent: [166, 54, 42], portraitOpacity: 1 },
  { at: 18, page: [117, 112, 106], surface: [154, 148, 140], surface2: [128, 122, 115], ink: [24, 22, 20], secondary: [65, 61, 56], accent: [154, 56, 42], portraitOpacity: 1 },
  { at: 24, page: [43, 39, 37], surface: [48, 43, 40], surface2: [58, 51, 46], ink: [244, 241, 232], secondary: [184, 180, 169], accent: [181, 92, 54], portraitOpacity: 1 },
  { at: 30, page: [17, 17, 17], surface: [30, 27, 25], surface2: [41, 35, 30], ink: [244, 241, 232], secondary: [184, 180, 169], accent: [193, 154, 73], portraitOpacity: 1 }
];
function clampFrame(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(PREVIEW_MAX_FRAME, Math.max(0, Math.round(value)));
}
function frameForEffort(index, count) {
  if (count <= 1 || !Number.isFinite(index)) return 0;
  const safe = Math.min(count - 1, Math.max(0, Math.round(index)));
  return Math.round(safe / (count - 1) * PREVIEW_MAX_FRAME);
}
function nearestEffortIndex(frame, efforts) {
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
function selectedEffortIndex(efforts, selectedId, defaultId) {
  const id = selectedId ?? defaultId;
  return id === void 0 ? -1 : efforts.findIndex((effort) => effort.id === id);
}
function liangRankForFrame(rawFrame) {
  const level = clampFrame(rawFrame) / PREVIEW_MAX_FRAME * MAX_LEVEL;
  const index = level >= MAX_LEVEL ? LIANG_RANKS.length - 1 : Math.floor(level / 6);
  return LIANG_RANKS[Math.min(LIANG_RANKS.length - 1, Math.max(0, index))];
}
function indicatorLabel(rawFrame, efforts, options = {}) {
  const effort = efforts[nearestEffortIndex(rawFrame, efforts)];
  const rank = `${liangRankForFrame(rawFrame)}${options.withLevel ? ` ${levelForFrame(rawFrame)}` : ""}`;
  return effort === void 0 ? rank : `${rank} \xB7 ${effort.name}`;
}
function lerp(a, b, amount) {
  return a + (b - a) * amount;
}
function mix2(a, b, amount) {
  return [
    Math.round(lerp(a[0], b[0], amount)),
    Math.round(lerp(a[1], b[1], amount)),
    Math.round(lerp(a[2], b[2], amount))
  ];
}
function rgb(value, alpha = 1) {
  return alpha === 1 ? `rgb(${value[0]}, ${value[1]}, ${value[2]})` : `rgba(${value[0]}, ${value[1]}, ${value[2]}, ${alpha})`;
}
function paletteForFrame(rawFrame) {
  const frame = clampFrame(rawFrame);
  const level = frame / PREVIEW_MAX_FRAME * MAX_LEVEL;
  const portraitStage = Math.min(5, Math.floor(level / 6));
  const portraitFrom = STOPS[portraitStage];
  const portraitTo = STOPS[Math.min(5, portraitStage + 1)];
  const portraitAmount = portraitFrom === portraitTo ? 0 : (level - portraitFrom.at) / (portraitTo.at - portraitFrom.at);
  const dark = level >= 24;
  const stage = dark ? 5 : 0;
  const ui = dark ? STOPS[5] : STOPS[0];
  const page = ui.page;
  const surface = ui.surface;
  const surface2 = ui.surface2;
  const sidebar = mix2(page, surface2, 0.25);
  const ink = ui.ink;
  const secondary = ui.secondary;
  const accent = dark ? [193, 154, 73] : [65, 118, 230];
  const accentHover = mix2(accent, ink, 0.13);
  return {
    level,
    stage,
    strength: level / MAX_LEVEL,
    page: rgb(page),
    // Keep the shell readable while allowing the right-side portrait to remain
    // visibly present. Dense controls use deliberately translucent layers.
    base: rgb(page, dark ? 0.42 : 0.28),
    maskBase: rgb(page, dark ? 0.42 : 0.28),
    maskStrong: rgb(page, 0.46),
    maskSoft: rgb(page, 0.2),
    controlRail: rgb(secondary, 0.28),
    controlBorder: rgb(secondary, 0.72),
    controlFill: rgb(mix2(surface, secondary, 0.22)),
    layer1: rgb(surface, 0.58),
    layer2: rgb(surface2, 0.6),
    layer3: rgb(surface2, 0.7),
    sidebar: rgb(sidebar, 0.66),
    ink: rgb(ink),
    secondary: rgb(secondary),
    tertiary: rgb(mix2(secondary, page, 0.28)),
    border: rgb(ink, dark ? 0.15 : 0.12),
    accent: rgb(accent),
    accentHover: rgb(accentHover),
    hover: rgb(ink, dark ? 0.09 : 0.07),
    portraitOpacity: String(lerp(
      portraitFrom.portraitOpacity,
      portraitTo.portraitOpacity,
      portraitAmount
    ))
  };
}

// src/client/index.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var PACKAGE_ID = "dsh-client-liang-intensity-skin";
var LOCALE_NAMESPACE = "liang.skin";
var ASSET_PREFIX = `/plugins/${PACKAGE_ID}/assets`;
var BUNDLE_PACKAGE_ID = "@leon___/dsh-client-liang-intensity-skin";
var CONVERSATION_COLUMN_SELECTORS = [
  '[data-pane="conversation"]',
  '[class*="centerCol"]'
];
function findConversationColumn() {
  for (const selector of CONVERSATION_COLUMN_SELECTORS) {
    const column = document.querySelector(selector);
    if (column !== null) return column;
  }
  return null;
}
var PORTRAIT_ANCHORS = [
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
  { level: 30, file: "stage-30.webp" }
];
var cssVariables = [
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
  "--liang-portrait-opacity"
];
var SkinPresenter = class {
  scope;
  root;
  portraits;
  portraitSet = false;
  ambient = null;
  particleCanvas = null;
  motion = null;
  running = false;
  previewing = false;
  enabled = false;
  // Default to the max frame so the first paint after load is the dark shell;
  // starting at 0 flashed the light palette before the directory resolved.
  frame = PREVIEW_MAX_FRAME;
  pendingFrame = PREVIEW_MAX_FRAME;
  raf = 0;
  disposed = false;
  placementObserver;
  unsubscribe;
  constructor(scope) {
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
  mountBackdrop() {
    const column = findConversationColumn();
    if (column === null) return false;
    if (this.root.parentElement !== column) column.insertBefore(this.root, column.firstChild);
    return true;
  }
  createPortraits(xianxia) {
    this.root.dataset.portraitSet = xianxia ? "xianxia" : "original";
    return createPortraitLoader({
      sources: PORTRAIT_ANCHORS.map(({ level, file }) => ({
        level,
        url: `${ASSET_PREFIX}/${xianxia ? "portrait-source-xianxia-v2" : "portrait-source-v2"}/${file}`
      })),
      onChange: ({ image }) => {
        if (this.disposed || !this.enabled) return;
        if (image === null) {
          this.root.dataset.media = "color";
          for (const node of this.root.querySelectorAll("img")) node.remove();
          return;
        }
        const portrait = image;
        portrait.className = "liang-skin-sequence-frame";
        portrait.alt = "";
        portrait.draggable = false;
        if (this.root.querySelector("img") !== portrait) {
          for (const node of this.root.querySelectorAll("img")) node.remove();
          this.root.prepend(portrait);
        }
        this.root.dataset.media = "sequence";
        this.syncParticleAnchors();
      }
    });
  }
  syncSettings() {
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
  syncOptionalEffects() {
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
  syncParticleAnchors = () => {
    if (this.ambient === null) return;
    const bounds = this.root.getBoundingClientRect();
    const input = this.root.parentElement?.querySelector(".liang-effort-control")?.getBoundingClientRect();
    const image = this.root.querySelector("img")?.getBoundingClientRect();
    this.ambient.setAnchor(input?.right ?? bounds.left + bounds.width * 0.6, input ? input.top + input.height / 2 : bounds.top + bounds.height * 0.7);
    this.ambient.setTarget(image ? image.left + image.width * 0.55 : bounds.right - bounds.width * 0.18, image ? image.top + image.height * 0.3 : bounds.top + bounds.height * 0.3);
  };
  setRunning(running) {
    this.running = running;
    this.motion?.setRunning(running);
  }
  setPreviewing(previewing) {
    this.previewing = previewing;
    this.motion?.setPreviewing(previewing);
  }
  isEnabled() {
    return this.enabled;
  }
  getFrame() {
    return this.frame;
  }
  setEnabled(enabled) {
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
  setMaskEnabled(enabled) {
    if (this.disposed) return;
    this.root.dataset.mask = enabled ? "on" : "off";
  }
  setFrame(frame) {
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
  applyFrame() {
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
  updatePortrait(level) {
    this.portraits.select(level);
  }
  async choose(enabled) {
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
};
function modelReasoning(state) {
  const current = state.current;
  if (current === null) return null;
  const group = state.groups.find((item) => item.id === current.provider);
  const model = group?.models.find((item) => item.id === current.model);
  if (model?.reasoning === void 0) return null;
  return {
    selection: current,
    efforts: model.reasoning.efforts,
    defaultEffort: model.reasoning.defaultEffort
  };
}
function useSessionRunning(session) {
  return (0, import_react3.useSyncExternalStore)(
    (listener) => session?.subscribe(listener) ?? (() => {
    }),
    () => session?.getSnapshot()?.running === true
  );
}
function LiangEffortSlider({ directory, load: load2, select, presenter, scope, available, session }) {
  const state = (0, import_react3.useSyncExternalStore)(
    (listener) => directory.subscribe(listener),
    () => directory.getSnapshot()
  );
  const skin = (0, import_react3.useSyncExternalStore)(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot()
  );
  const reasoning = (0, import_react3.useMemo)(() => modelReasoning(state), [state]);
  const efforts = reasoning?.efforts ?? [];
  const committedIndex = selectedEffortIndex(
    efforts,
    reasoning?.selection.reasoningEffort,
    reasoning?.defaultEffort
  );
  const effortFrame = committedIndex < 0 ? PREVIEW_MAX_FRAME : frameForEffort(committedIndex, efforts.length);
  const bindEffort = skin.bindEffort;
  const fine = bindEffort && skin.fineStopsEnabled;
  const committedFrame = fine ? snapFrame(effortFrame) : effortFrame;
  const modelKey = JSON.stringify([reasoning?.selection.provider, reasoning?.selection.model, efforts.map((effort) => effort.id)]);
  const selectionKey = JSON.stringify([modelKey, efforts[committedIndex]?.id ?? null]);
  const modeKey = JSON.stringify([modelKey, bindEffort, fine]);
  const sync = (0, import_react3.useRef)(createEffortSync());
  const latest = (0, import_react3.useRef)({ modelKey, committedFrame });
  latest.current = { modelKey, committedFrame };
  const running = useSessionRunning(session);
  const [frame, setFrame] = (0, import_react3.useState)(() => bindEffort ? committedFrame : presenter.getFrame());
  const [pending, setPending] = (0, import_react3.useState)(false);
  const [failed, setFailed] = (0, import_react3.useState)(false);
  const [interacting, setInteracting] = (0, import_react3.useState)(false);
  const dragging = (0, import_react3.useRef)(false);
  const dragStartFrame = (0, import_react3.useRef)(frame);
  const dragStartSelection = (0, import_react3.useRef)(selectionKey);
  const enabled = skin.enabled && available;
  const cancelInteraction = (0, import_react3.useCallback)(() => {
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
  (0, import_react3.useEffect)(() => {
    if (!skin.hideSlider) return;
    if (dragging.current) cancelInteraction();
    else {
      setInteracting(false);
      presenter.setPreviewing(false);
    }
  }, [skin.hideSlider, cancelInteraction, presenter]);
  (0, import_react3.useEffect)(() => {
    if (enabled) load2();
  }, [enabled, load2]);
  (0, import_react3.useEffect)(() => {
    if (!available) return;
    presenter.setRunning(running);
    return () => presenter.setRunning(false);
  }, [presenter, running, available]);
  (0, import_react3.useEffect)(() => available ? () => presenter.setPreviewing(false) : void 0, [presenter, available]);
  (0, import_react3.useEffect)(() => {
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
  const commit = async (rawFrame) => {
    if (!bindEffort) {
      dragging.current = false;
      setFrame(rawFrame);
      presenter.setFrame(rawFrame);
      return;
    }
    const fineFrame = fine ? snapFrame(rawFrame) : rawFrame;
    const targetIndex = nearestEffortIndex(fineFrame, efforts);
    const target = efforts[targetIndex];
    if (target === void 0) return;
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
      reasoningEffort: target.id
    });
    setPending(false);
    if (!accepted) {
      sync.current.reset();
      setFailed(true);
      setFrame(latest.current.committedFrame);
      presenter.setFrame(latest.current.committedFrame);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "liang-effort-control",
      "data-plugin": PACKAGE_ID,
      "data-state": failed ? "error" : pending ? "pending" : "ready",
      title: bindEffort ? previewEffort?.name : void 0,
      children: [
        interacting && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "output",
          {
            className: "liang-effort-control__tooltip",
            style: { "--liang-slider-ratio": progressRatio },
            children: tooltipLabel
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "liang-effort-control__ticks", "aria-hidden": "true", children: [
          fine && Array.from({ length: MAX_LEVEL + 1 }, (_, level) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "i",
            {
              className: "liang-effort-control__tick liang-effort-control__tick--minor",
              style: { left: `${frameForLevel(level) / PREVIEW_MAX_FRAME * 100}%` }
            },
            `fine-${level}`
          )),
          efforts.map((effort, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "i",
            {
              className: "liang-effort-control__tick",
              style: { left: `${frameForEffort(index, efforts.length) / PREVIEW_MAX_FRAME * 100}%` }
            },
            effort.id
          ))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            className: "liang-effort-control__range",
            type: "range",
            min: 0,
            max: PREVIEW_MAX_FRAME,
            step: fine ? PREVIEW_MAX_FRAME / MAX_LEVEL : 1,
            value: frame,
            disabled: pending || state.status === "selecting",
            "aria-label": bindEffort ? "\u601D\u8003\u7B49\u7EA7" : "\u76AE\u80A4\u8FDB\u5EA6",
            "aria-valuetext": bindEffort ? previewEffort?.name ?? "" : tooltipLabel,
            onPointerDown: () => {
              dragging.current = true;
              dragStartFrame.current = frame;
              dragStartSelection.current = selectionKey;
              setInteracting(true);
              presenter.setPreviewing(true);
            },
            onInput: (event) => {
              dragging.current = true;
              const next = Number(event.currentTarget.value);
              setFrame(next);
              presenter.setFrame(next);
            },
            onPointerUp: (event) => {
              setInteracting(false);
              presenter.setPreviewing(false);
              void commit(Number(event.currentTarget.value));
            },
            onPointerCancel: cancelInteraction,
            onKeyUp: (event) => {
              setInteracting(false);
              presenter.setPreviewing(false);
              if (event.key !== "Escape") void commit(Number(event.currentTarget.value));
            },
            onBlur: (event) => {
              setInteracting(false);
              presenter.setPreviewing(false);
              if (dragging.current) void commit(Number(event.currentTarget.value));
            },
            onKeyDown: (event) => {
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
            }
          }
        )
      ]
    }
  );
}
function LiangSettingsPage(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "liang-settings-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "liang-settings-page__title", children: props.t("settings.title") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SettingsPanel, { ...props })
  ] });
}
var inject = [
  "slots",
  "sessions",
  "modelDirectories",
  "locale"
];
function apply(ctx) {
  const style = document.createElement("style");
  style.dataset.plugin = PACKAGE_ID;
  style.textContent = [skin_default, optional_visuals_default, settings_panel_default, update_controls_default].join("\n");
  document.head.append(style);
  ctx.effect(() => () => style.remove(), "liang-intensity-skin: scoped styles");
  const scope = createPreferenceStore();
  ctx.effect(() => () => scope.dispose(), "liang-intensity-skin: appearance preference");
  const updater = createSkinUpdater({
    loadedVersion: "0.1.15-settings.4",
    manager: () => {
      try {
        return ctx.get("remote")?.pluginManager;
      } catch {
        return void 0;
      }
    }
  });
  ctx.effect(() => () => updater.dispose(), "liang-intensity-skin: update state");
  const presenter = new SkinPresenter(scope);
  ctx.effect(() => () => presenter.dispose(), "liang-intensity-skin: backdrop presenter");
  ctx.effect(
    () => ctx.locale.register(LOCALE_NAMESPACE, {
      zh: { ...SETTINGS_LOCALES.zh, ...UPDATE_LOCALES.zh },
      en: { ...SETTINGS_LOCALES.en, ...UPDATE_LOCALES.en }
    }),
    "liang-intensity-skin: settings locale"
  );
  ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
    name: "plugins.bundle.config",
    key: BUNDLE_PACKAGE_ID,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope, updater })
  }, SettingsPanel));
  const settingsTitle = ctx.locale.bind(LOCALE_NAMESPACE);
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "liang-skin-settings",
    order: 46,
    label: () => settingsTitle("settings.title"),
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope, updater })
  }, LiangSettingsPage));
  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "liang-intensity-control",
    order: 10,
    inject: (sessionId) => {
      const available = ctx.sessions.subagentAddress(sessionId) === void 0;
      const directory = ctx.modelDirectories.directoryFor(sessionId);
      const sessions = ctx.sessions;
      const sessionScope = sessions.scope?.(sessionId);
      const session = sessionScope === void 0 ? void 0 : sessions.sessionOf?.(sessionScope);
      return {
        available,
        session,
        directory: directory.store,
        presenter,
        scope,
        load: () => {
          if (available) void directory.load().catch(() => void 0);
        },
        select: (selection) => available ? directory.select(selection).then((result) => result.ok, () => false) : Promise.resolve(false)
      };
    }
  }, LiangEffortSlider));
}
return module.exports;}});
//# sourceMappingURL=client.js.map
