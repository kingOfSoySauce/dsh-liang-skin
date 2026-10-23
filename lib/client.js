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
var import_react2 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/skin.css
var skin_default = `@property --liang-corner-cut {
  syntax: "<percentage>";
  inherits: true;
  initial-value: 30%;
}

@property --liang-corner-feather {
  syntax: "<percentage>";
  inherits: true;
  initial-value: 26.7%;
}

@property --liang-h12 { syntax: "<number>"; inherits: true; initial-value: 0.1; }
@property --liang-h20 { syntax: "<number>"; inherits: true; initial-value: 0.2; }
@property --liang-h30 { syntax: "<number>"; inherits: true; initial-value: 0.3; }
@property --liang-h88 { syntax: "<number>"; inherits: true; initial-value: 0.3; }
@property --liang-h100 { syntax: "<number>"; inherits: true; initial-value: 0.3; }
@property --liang-v0 { syntax: "<number>"; inherits: true; initial-value: 0.1; }
@property --liang-v12 { syntax: "<number>"; inherits: true; initial-value: 0.3; }
@property --liang-v88 { syntax: "<number>"; inherits: true; initial-value: 0.3; }
@property --liang-v100 { syntax: "<number>"; inherits: true; initial-value: 0.1; }

.liang-skin-backdrop {
  position: fixed;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--liang-page, transparent);
  --liang-corner-cut: 30%;
  --liang-corner-feather: 26.7%;
  --liang-h12: 0.1;
  --liang-h20: 0.2;
  --liang-h30: 0.3;
  --liang-h88: 0.3;
  --liang-h100: 0.3;
  --liang-v0: 0.1;
  --liang-v12: 0.3;
  --liang-v88: 0.3;
  --liang-v100: 0.1;
  opacity: 0;
  transition:
    opacity 220ms ease,
    background-color 180ms linear,
    --liang-corner-cut 1400ms ease,
    --liang-corner-feather 1400ms ease,
    --liang-h12 1400ms ease,
    --liang-h20 1400ms ease,
    --liang-h30 1400ms ease,
    --liang-h88 1400ms ease,
    --liang-h100 1400ms ease,
    --liang-v0 1400ms ease,
    --liang-v12 1400ms ease,
    --liang-v88 1400ms ease,
    --liang-v100 1400ms ease;
}

body[data-liang-skin="on"] .liang-skin-backdrop {
  opacity: 1;
}

.liang-skin-backdrop[data-engaged="true"] {
  --liang-corner-cut: 20%;
  --liang-corner-feather: 40%;
  --liang-h12: 0.2;
  --liang-h20: 0.3;
  --liang-h30: 0.5;
  --liang-h88: 0.5;
  --liang-h100: 0.5;
}

.liang-skin-backdrop[data-preview="true"] {
  --liang-corner-cut: 10%;
  --liang-corner-feather: 40%;
  --liang-h12: 1;
  --liang-h20: 1;
  --liang-h30: 1;
  --liang-h88: 1;
  --liang-h100: 0;
  transition:
    opacity 220ms ease,
    background-color 180ms linear,
    --liang-corner-cut 260ms ease,
    --liang-corner-feather 260ms ease,
    --liang-h12 260ms ease,
    --liang-h20 260ms ease,
    --liang-h30 260ms ease,
    --liang-h88 260ms ease,
    --liang-h100 260ms ease,
    --liang-v0 260ms ease,
    --liang-v12 260ms ease,
    --liang-v88 260ms ease,
    --liang-v100 260ms ease;
}

.liang-skin-backdrop img {
  position: absolute;
  top: 50%;
  right: 0;
  display: block;
  width: min(var(--liang-tune-width, 42vw), 720px);
  height: 100%;
  object-fit: cover;
  object-position: 50% var(--liang-tune-object-y, 42%);
  opacity: var(--liang-portrait-opacity, 0.45);
  transform: translateY(-50%);
  filter: none;
  /* Edge fade values are state variables: idle has a 30% left fade, running
     adds the other three 12% edges, the slider uses 12% on all four. */
  /* The middle must stay fully opaque: these masks only feather the edges.
     Keeping h30/h88 below 1 darkened the whole portrait. */
  --liang-image-h: linear-gradient(90deg,
    rgb(0 0 0 / 0) 0%,
    rgb(0 0 0 / var(--liang-h12)) 12%,
    rgb(0 0 0 / var(--liang-h20)) 20%,
    rgb(0 0 0 / 1) 32%,
    rgb(0 0 0 / 1) 86%,
    rgb(0 0 0 / var(--liang-h88)) 94%,
    rgb(0 0 0 / var(--liang-h100)) 100%);
  --liang-image-v: linear-gradient(180deg,
    rgb(0 0 0 / var(--liang-v0)) 0%,
    rgb(0 0 0 / var(--liang-v12)) 12%,
    rgb(0 0 0 / 1) 26%,
    rgb(0 0 0 / 1) 84%,
    rgb(0 0 0 / var(--liang-v88)) 92%,
    rgb(0 0 0 / var(--liang-v100)) 100%);
  /* Four elliptical corner masks. The cut is a percentage of the image's
     width/height (30/20/10); the feather is a percentage of the ellipse and
     maps back to the 8/8/4 image-percent blur in each state. */
  --liang-corner-tl: radial-gradient(ellipse var(--liang-corner-cut) var(--liang-corner-cut) at 0 0,
    rgb(0 0 0 / 0) 0%,
    rgb(0 0 0 / 0) calc(100% - var(--liang-corner-feather)),
    rgb(0 0 0 / 1) 100%);
  --liang-corner-tr: radial-gradient(ellipse var(--liang-corner-cut) var(--liang-corner-cut) at 100% 0,
    rgb(0 0 0 / 0) 0%,
    rgb(0 0 0 / 0) calc(100% - var(--liang-corner-feather)),
    rgb(0 0 0 / 1) 100%);
  --liang-corner-bl: radial-gradient(ellipse var(--liang-corner-cut) var(--liang-corner-cut) at 0 100%,
    rgb(0 0 0 / 0) 0%,
    rgb(0 0 0 / 0) calc(100% - var(--liang-corner-feather)),
    rgb(0 0 0 / 1) 100%);
  --liang-corner-br: radial-gradient(ellipse var(--liang-corner-cut) var(--liang-corner-cut) at 100% 100%,
    rgb(0 0 0 / 0) 0%,
    rgb(0 0 0 / 0) calc(100% - var(--liang-corner-feather)),
    rgb(0 0 0 / 1) 100%);
  -webkit-mask-image: var(--liang-image-h), var(--liang-image-v), var(--liang-corner-tl), var(--liang-corner-tr), var(--liang-corner-bl), var(--liang-corner-br);
  mask-image: var(--liang-image-h), var(--liang-image-v), var(--liang-corner-tl), var(--liang-corner-tr), var(--liang-corner-bl), var(--liang-corner-br);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  transition: filter 180ms linear;
}

.liang-skin-backdrop img {
  display: none;
}

.liang-skin-backdrop[data-media="sequence"] .liang-skin-sequence-frame {
  display: block;
  opacity: var(--liang-portrait-opacity, 0.82);
}

.liang-skin-backdrop[data-media="color"] img {
  display: none;
}

.liang-skin-backdrop::after {
  position: absolute;
  inset: 0;
  content: "";
  opacity: var(--liang-tune-scrim, 1);
  background:
    linear-gradient(90deg, var(--liang-page, transparent) 0 28%, transparent 57% 100%),
    linear-gradient(var(--liang-bg-base, transparent), var(--liang-bg-base, transparent));
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
  --dsw-alias-brand-primary-new-colorprimary-new-color: rgb(65 118 230) !important;
  --dsw-alias-brand-primary: rgb(15 17 21) !important;
  --dsw-alias-brand-text: rgb(15 17 21) !important;
  --dsw-alias-button-primary-fill: rgb(15 17 21) !important;
  --dsw-alias-button-primary-hover: rgb(53 54 56) !important;
  --dsw-alias-button-info-fill: rgb(65 118 230) !important;
  --dsw-alias-button-info-hover: rgb(103 158 254) !important;
  --dsw-alias-state-business-primary: rgb(65 118 230) !important;
  --dsw-alias-label-primary-inverted: rgb(249 250 251) !important;
  --dsw-alias-button-elevated-fill: rgb(255 255 255) !important;
  --dsw-alias-button-floating-fill: rgb(255 255 255) !important;
  --dsw-alias-button-floating-hover: rgb(241 243 245) !important;
  --dsw-alias-interactive-bg-hover-solid: rgb(241 243 245) !important;
  --dsw-specific-bubble: rgb(237 243 254) !important;
  --dsw-specific-input-major: rgb(255 255 255) !important;
  --dsw-specific-menu: rgb(255 255 255) !important;
  --dsw-specific-selector: rgb(245 246 247) !important;
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
  fill: rgb(15 17 21) !important;
}

body[data-liang-skin="on"]:is(
  [data-liang-stage="0"],
  [data-liang-stage="1"],
  [data-liang-stage="2"],
  [data-liang-stage="3"]
) button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"] svg[viewBox="0 0 182 24"] > g[clip-path*="badge"] path {
  fill: rgb(249 250 251) !important;
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
  color: rgb(255 255 255 / 92%) !important;
  background: rgb(65 118 230 / 42%) !important;
  opacity: 1;
}

body[data-liang-skin="on"] > #root {
  background: transparent !important;
}

body[data-liang-skin="on"]:is(
  [data-dsh-desktop-mode="compatibility"],
  [data-dsh-desktop-mode="extended"]
) .liang-skin-backdrop {
  top: var(--dsh-desktop-frame-height, 0px);
}

/* Native account pages are full-screen body portals. Their header and loading
   surface must stay opaque when the chat background token is transparent. */
body[data-liang-skin="on"] > [role="dialog"][aria-modal="true"][class*="_overlay"]:has(> header[data-window-drag] button[class*="_back"]):has(> [class*="_viewport"]) {
  --dsw-alias-bg-base: var(--liang-page, #fff) !important;
  background: var(--liang-page, #fff) !important;
}

/* Windows paints the sidebar fill across the host frame, covering the portrait.
   Match macOS's transparent frame while keeping the sidebar, caption, and
   conversation surfaces painted by their own host rules. */
html[data-windows-titlebar] body[data-liang-skin="on"] #root [class*="_frame"]:has(> [class*="_centerCol"]) {
  background: transparent !important;
}

/* macOS adds different translucent sidebar materials for native light/dark.
   While Liang is active, the effort palette owns the sidebar fill. */
html[data-platform="darwin"] body[data-liang-skin="on"] #root [class*="_frame"]:has(> [class*="_centerCol"]) > [class*="_sidebarCol"] {
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
  box-shadow: 0 8px 28px rgb(20 22 20 / 8%);
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
  --liang-control-rail: var(--dsw-alias-border-l3, rgb(0 0 0 / 16%));
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
  --liang-control-rail: color-mix(in srgb, var(--liang-secondary) 28%, transparent);
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
  border: 1px solid var(--liang-border, rgb(0 0 0 / 12%));
  border-radius: 7px;
  color: var(--liang-ink, #171816);
  background: var(--liang-layer-1, #fff);
  box-shadow: 0 5px 16px rgb(0 0 0 / 16%);
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

/* Fine stops (0\u201330). Short and faint so the effort anchors still read as the
   model's real levels, while the rail shows every usable position. */
.liang-effort-control__tick--minor {
  height: 3px;
  opacity: 0.2;
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
  border: 1.5px solid color-mix(in srgb, var(--liang-control-accent) 72%, transparent);
  border-radius: 50%;
  appearance: none;
  background: radial-gradient(circle, var(--liang-control-accent) 0 2px, color-mix(in srgb, var(--liang-control-accent) 22%, var(--dsw-alias-bg-layer-1, #fff)) 2.5px);
  box-shadow: 0 1px 4px rgb(0 0 0 / 14%);
}

body[data-liang-skin="on"] .liang-effort-control__range::-webkit-slider-thumb {
  width: 13px;
  height: 13px;
  margin-top: -6px;
  border-color: color-mix(in srgb, var(--liang-control-accent) 72%, transparent);
  background: radial-gradient(circle, var(--liang-control-accent) 0 2px, color-mix(in srgb, var(--liang-control-accent) 22%, var(--liang-layer-1)) 2.5px);
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
  border: 1.5px solid color-mix(in srgb, var(--liang-control-accent) 72%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--liang-control-accent) 24%, var(--dsw-alias-bg-layer-1, #fff));
}

.liang-effort-control__range:focus-visible {
  outline: none;
}

.liang-effort-control[data-state="error"] {
  --liang-control-accent: var(--dsw-alias-state-error-primary, #e43c3c);
}

.liang-appearance-choice {
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l2);
  flex: 180px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 20px 32px;
  border-radius: 16px;
  font: inherit;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  background: transparent;
  font-size: 14px;
  line-height: 22px;
  display: flex;
}

[class*="_cubeRow"]:has(.liang-appearance-choice) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.liang-appearance-choice:hover:not([aria-pressed="true"]) {
  background: var(--dsw-alias-interactive-bg-hover);
}

.liang-appearance-choice[aria-pressed="true"] {
  border-color: var(--dsw-static-neutral-bluish-400);
  background: var(--dsw-alias-bg-module-platform);
}

.liang-appearance-choice__icon {
  display: block;
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  color: currentColor;
  font-size: 16px;
  line-height: 16px;
}

.liang-appearance-choice__label {
  display: block;
}

/* Keep the host's three theme cubes untouched. These rules only style the
   fourth button that is appended to the host cube row. */
.liang-appearance-choice:disabled {
  cursor: progress;
  opacity: 0.7;
}

.liang-appearance-binding {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
  font-size: 14px;
  line-height: 20px;
}

@media (max-width: 760px) {
  .liang-effort-control {
    width: 92px;
  }

  .liang-skin-backdrop img {
    right: -18vw;
    width: 92vw;
    opacity: calc(var(--liang-portrait-opacity, 0.45) * 0.72);
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

/* --- Animated backdrop: crossfading portrait stack + additive light layer --- */
.liang-skin-portrait-stack {
  position: absolute;
  inset: 0;
  display: none;
  opacity: var(--liang-portrait-opacity, 0.82);
  transition: opacity 260ms ease;
}

.liang-skin-backdrop[data-media="sequence"] .liang-skin-portrait-stack {
  display: block;
}

.liang-skin-backdrop img.liang-skin-frame {
  display: block;
  opacity: 0;
  transition: opacity 650ms ease;
}

.liang-skin-backdrop img.liang-skin-frame[data-active="true"] {
  opacity: 1;
}

.liang-skin-ambient {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 1;
  transition: opacity 300ms ease;
}

@media (max-width: 760px) {
  .liang-skin-portrait-stack {
    opacity: calc(var(--liang-portrait-opacity, 0.82) * 0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .liang-skin-portrait-stack,
  .liang-skin-backdrop img.liang-skin-frame,
  .liang-skin-ambient {
    transition: none;
  }
}

/* --- Engagement: the immortal surfaces while a turn runs, then withdraws --- */
.liang-skin-portrait-stack {
  transform-origin: 50% 42%;
  filter: brightness(var(--liang-tune-brightness, 1.15)) contrast(var(--liang-tune-contrast, 1.05));
  transition: opacity 1400ms ease, transform 1800ms ease;
  /* Gaussian falloff (sigma ~0.37) sampled into gradient stops. The veil is
     constant across all three states; the stack opacity below sets the
     centre strength (30% idle, 70% running, 100% slider preview). */
  /* Centre the Gaussian on the portrait itself, not on the viewport: the
     image is right-aligned with width min(42vw, 720px), so its centre is at
     100% - min(21vw, 360px), 50%. The centre alpha is always 1; the stack
     opacity (30/70/100%) sets the actual centre strength. */
  --liang-veil: radial-gradient(ellipse var(--liang-tune-ew, 40%) var(--liang-tune-eh, 56%) at var(--liang-tune-cx, calc(100% - min(21vw, 360px))) var(--liang-tune-cy, 50%),
    rgb(0 0 0 / 1) 0%,
    rgb(0 0 0 / 1) var(--liang-tune-plateau, 62%),
    rgb(0 0 0 / 0.97) 72%,
    rgb(0 0 0 / 0.86) 82%,
    rgb(0 0 0 / var(--liang-tune-a90, 0.58)) 90%,
    rgb(0 0 0 / var(--liang-tune-a96, 0.24)) 96%,
    rgb(0 0 0 / var(--liang-tune-edge, 0.02)) 100%);
  -webkit-mask-image: var(--liang-veil);
  mask-image: var(--liang-veil);
}

.liang-skin-backdrop[data-engaged="true"] .liang-skin-portrait-stack {
  opacity: var(--liang-tune-running-opacity, 0.7);
  transform: scale(var(--liang-tune-running-scale, 1));
  --liang-corner-cut: var(--liang-tune-running-cut, 20%);
  --liang-corner-feather: var(--liang-tune-running-feather, 40%);
}

/* Idle: the mask keeps the centre readable as a ghost (~42%) while the rim
   fades to ~2%, so the silhouette dissolves into the void. */
.liang-skin-backdrop[data-engaged="false"] .liang-skin-portrait-stack {
  opacity: var(--liang-tune-idle-opacity, 0.3);
  transform: scale(var(--liang-tune-idle-scale, 1.035));
  --liang-corner-cut: var(--liang-tune-idle-cut, 30%);
  --liang-corner-feather: var(--liang-tune-idle-feather, 26.7%);
}

/* Dragging the slider reveals the portrait completely. */
.liang-skin-backdrop[data-preview="true"] .liang-skin-portrait-stack,
.liang-skin-backdrop[data-preview="true"][data-engaged="true"] .liang-skin-portrait-stack {
  opacity: var(--liang-tune-preview-opacity, 1);
  transform: scale(var(--liang-tune-preview-scale, 1));
  --liang-corner-cut: var(--liang-tune-preview-cut, 10%);
  --liang-corner-feather: var(--liang-tune-preview-feather, 40%);
  transition: opacity 260ms ease, transform 260ms ease;
}

.liang-skin-backdrop[data-engaged="false"] .liang-skin-ambient {
  opacity: 0.85;
}

.liang-skin-backdrop[data-engaged="false"] .liang-skin-frame {
  transition-duration: 1400ms;
}

@media (prefers-reduced-motion: reduce) {
  .liang-skin-portrait-stack {
    transition: none;
  }
}


/* --- Parameter tuner (temporary entry, hide when values settle) --- */
.liang-tuner {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.liang-tuner__toggle {
  width: 20px;
  height: 20px;
  margin-left: 4px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--liang-secondary, #888) 40%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--liang-layer-2, #222) 70%, transparent);
  color: var(--liang-secondary, #aaa);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}

.liang-tuner__toggle[data-open="true"] {
  color: var(--liang-accent, #d6a34e);
  border-color: var(--liang-accent, #d6a34e);
}

.liang-tuner__panel {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 132px;
  z-index: 2147483000;
  width: 330px;
  padding: 12px 14px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 14px;
  background: rgb(18 18 20 / 96%);
  color: rgb(240 240 240 / 92%);
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 16px 48px rgb(0 0 0 / 55%);
  backdrop-filter: blur(14px);
}

.liang-tuner__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.liang-tuner__head button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
}

.liang-tuner__tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.liang-tuner__tabs button {
  flex: 1;
  padding: 4px 0;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.liang-tuner__tabs button[data-active="true"] {
  border-color: var(--liang-accent, #d6a34e);
  color: var(--liang-accent, #d6a34e);
}

.liang-tuner__section {
  margin: 10px 0 4px;
  color: rgb(255 255 255 / 55%);
  font-size: 11px;
}

.liang-tuner__row {
  display: grid;
  grid-template-columns: 62px 1fr 38px;
  align-items: center;
  gap: 8px;
  margin: 3px 0;
}

.liang-tuner__row input[type="range"] {
  width: 100%;
  accent-color: var(--liang-accent, #d6a34e);
}

.liang-tuner__row output {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 72%);
}

.liang-tuner__foot {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.liang-tuner__foot button {
  flex: 1;
  padding: 5px 0;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.liang-tuner__link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0 8px;
  color: rgb(255 255 255 / 70%);
  font-size: 11px;
}

.liang-tuner__link input {
  accent-color: var(--liang-accent, #d6a34e);
}
`;

// src/client/appearance.ts
var NATIVE_APPEARANCE_ROW = '[class*="_cubeRow"]';
var LIANG_APPEARANCE_BUTTON = "liang-appearance-choice";
function hasClassSuffix(node, suffix) {
  return [...node.classList].some((name) => name.endsWith(suffix));
}
function findAppearanceRow() {
  for (const row of document.querySelectorAll(NATIVE_APPEARANCE_ROW)) {
    if (!hasClassSuffix(row, "_cubeRow")) continue;
    const nativeButtons = [...row.children].filter(
      (node) => node instanceof HTMLButtonElement && hasClassSuffix(node, "_themeCube")
    );
    if (nativeButtons.length < 3) continue;
    let group = row.parentElement;
    while (group !== null && !hasClassSuffix(group, "_group")) {
      group = group.parentElement;
    }
    group ??= row.parentElement;
    if (group !== null) return { row, group, nativeButtons };
  }
  return null;
}
function installLiangAppearanceButton(scope, presenter, packageId) {
  let pending = false;
  let disposed = false;
  let mounted = null;
  const nativeClickHandlers = /* @__PURE__ */ new Map();
  const unmount = () => {
    for (const [button, handler] of nativeClickHandlers) {
      button.removeEventListener("click", handler, { capture: true });
    }
    nativeClickHandlers.clear();
    if (mounted === null) return;
    mounted.button.removeEventListener("click", mounted.handleCustomClick);
    mounted.button.remove();
    mounted = null;
  };
  const choose = async (enabled) => {
    if (disposed || pending || scope.getSnapshot().enabled === enabled) return;
    pending = true;
    sync();
    try {
      await presenter.choose(enabled);
    } catch {
    } finally {
      pending = false;
      if (!disposed) sync();
    }
  };
  const createMount = (row, group) => {
    const english = document.documentElement.lang.toLowerCase().startsWith("en");
    const button = document.createElement("button");
    button.className = LIANG_APPEARANCE_BUTTON;
    button.type = "button";
    button.dataset.plugin = packageId;
    button.setAttribute("aria-label", "\u6ED1\u52A8\u53D8\u7956");
    const icon = document.createElement("span");
    icon.className = "liang-appearance-choice__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "\u25C8";
    const label = document.createElement("span");
    label.className = "liang-appearance-choice__label";
    label.textContent = english ? "Slider" : "\u6ED1\u52A8\u53D8\u7956";
    button.append(icon, label);
    const handleCustomClick = () => {
      void choose(true);
    };
    button.addEventListener("click", handleCustomClick);
    return { row, group, button, handleCustomClick };
  };
  const sync = () => {
    if (disposed) return;
    const target = findAppearanceRow();
    if (target === null) {
      unmount();
      return;
    }
    if (mounted !== null && (mounted.row !== target.row || mounted.group !== target.group)) {
      unmount();
    }
    mounted ??= createMount(target.row, target.group);
    const { row, button } = mounted;
    if (button.parentElement !== row) row.append(button);
    const snapshot = scope.getSnapshot();
    button.disabled = pending;
    button.setAttribute("aria-pressed", String(snapshot.enabled));
    for (const [nativeButton, handler] of nativeClickHandlers) {
      if (target.nativeButtons.includes(nativeButton)) continue;
      nativeButton.removeEventListener("click", handler, { capture: true });
      nativeClickHandlers.delete(nativeButton);
    }
    for (const nativeButton of target.nativeButtons) {
      if (nativeClickHandlers.has(nativeButton)) continue;
      const handleNativeClick = () => {
        void choose(false);
      };
      nativeClickHandlers.set(nativeButton, handleNativeClick);
      nativeButton.addEventListener("click", handleNativeClick, { capture: true });
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true });
  const unsubscribe = scope.subscribe(sync);
  sync();
  return () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    unsubscribe();
    unmount();
  };
}

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
  vec2 d = gl_PointCoord - vec2(0.5);
  float r = length(d) * 2.0;
  if (r > 1.0) discard;
  float core = pow(max(0.0, 1.0 - r), 2.6);
  float halo = pow(max(0.0, 1.0 - r), 1.1) * 0.35;
  float a = (core + halo) * v_alpha;
  gl_FragColor = vec4(v_color, a);
}
`;
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function mix(a, b, t) {
  return a + (b - a) * t;
}
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader === null) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
function createAmbient(canvas) {
  const display = canvas.getContext("2d");
  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance"
  });
  if (gl === null || display === null) {
    return { setLevel() {
    }, setAnchor() {
    }, setTarget() {
    }, start() {
    }, stop() {
    }, dispose() {
    } };
  }
  const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (vertex === null || fragment === null || program === null) {
    return { setLevel() {
    }, start() {
    }, stop() {
    }, dispose() {
    } };
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return { setLevel() {
    }, start() {
    }, stop() {
    }, dispose() {
    } };
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  const positionLocation = gl.getAttribLocation(program, "a_pos");
  const sizeLocation = gl.getAttribLocation(program, "a_size");
  const alphaLocation = gl.getAttribLocation(program, "a_alpha");
  const colorLocation = gl.getAttribLocation(program, "a_color");
  const resolutionLocation = gl.getUniformLocation(program, "u_res");
  const scaleLocation = gl.getUniformLocation(program, "u_scale");
  const alphaLocationU = gl.getUniformLocation(program, "u_alpha");
  if (buffer === null || positionLocation < 0 || sizeLocation < 0 || alphaLocation < 0 || colorLocation < 0 || resolutionLocation === null) {
    return { setLevel() {
    }, start() {
    }, stop() {
    }, dispose() {
    } };
  }
  const particles = [];
  const positions = new Float32Array(MAX_PARTICLES * 2);
  const sizes = new Float32Array(MAX_PARTICLES);
  const alphas = new Float32Array(MAX_PARTICLES);
  const colors = new Float32Array(MAX_PARTICLES * 3);
  let width = 1;
  let height = 1;
  let dpr = 1;
  let running = false;
  let disposed = false;
  let frameHandle = 0;
  let last = 0;
  let time = 0;
  let level = 20;
  let smoothLevel = 20;
  let smoothDark = 1;
  let active = 0;
  let pointerX = -1e4;
  let pointerY = -1e4;
  let pointerVX = 0;
  let pointerVY = 0;
  let pointerDown = false;
  let lastPointer = 0;
  let anchorX = 0.86;
  let anchorY = 0.6;
  let targetX = 0.78;
  let targetY = 0.4;
  const gold = [0.86, 0.68, 0.36];
  const cool = [0.74, 0.8, 0.92];
  const reset = (particle, randomLife) => {
    const spread = width * 0.05;
    particle.x = anchorX * width + (Math.random() - 0.5) * spread * 2;
    particle.y = anchorY * height + (Math.random() - 0.5) * spread * 1.4;
    particle.vx = (Math.random() - 0.5) * 90;
    particle.vy = -30 - Math.random() * 110;
    particle.life = randomLife ? Math.random() * 5 : 0;
    particle.maxLife = 3 + Math.random() * 4;
    particle.size = 2 + Math.random() * 3.2;
    particle.phase = Math.random() * TAU;
  };
  const riverPoint = (t, offset) => {
    const x0 = width * 0.84;
    const y0 = height * 1.08;
    const x1 = width * 0.6;
    const y1 = height * 0.96;
    const x2 = width * 0.84;
    const y2 = height * 0.7;
    const x3 = width * 0.97;
    const y3 = height * 0.44;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    const bend = Math.sin(t * Math.PI * 2.6 + time * 0.18) * width * 0.035;
    const spread = Math.sin(t * Math.PI) * width * 0.045 * offset;
    return {
      x: a * x0 + b * x1 + c * x2 + d * x3 + bend + spread,
      y: a * y0 + b * y1 + c * y2 + d * y3 + spread * 0.35
    };
  };
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.round(window.innerWidth * dpr);
    height = Math.round(window.innerHeight * dpr);
    glCanvas.width = width;
    glCanvas.height = height;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    gl.viewport(0, 0, width, height);
    gl.uniform2f(resolutionLocation, width, height);
  };
  const onResize = () => {
    resize();
    if (reduceMotion) render();
  };
  const onPointerMove = (event) => {
    const now = performance.now();
    const dt = lastPointer === 0 ? 16 : Math.max(8, now - lastPointer);
    const nx = event.clientX * dpr;
    const ny = event.clientY * dpr;
    if (pointerX > -1e3) {
      pointerVX = (nx - pointerX) / dt;
      pointerVY = (ny - pointerY) / dt;
    }
    pointerX = nx;
    pointerY = ny;
    lastPointer = now;
  };
  const onPointerDown = () => {
    pointerDown = true;
  };
  const onPointerUp = () => {
    pointerDown = false;
  };
  const onPointerLeave = () => {
    pointerX = -1e4;
    pointerY = -1e4;
    pointerDown = false;
  };
  const simulate = (dt) => {
    const targetCount = Math.round(240 + smoothLevel / 30 * (MAX_PARTICLES - 240));
    active = Math.min(MAX_PARTICLES, targetCount);
    const repelling = pointerDown || Math.hypot(pointerVX, pointerVY) > 1.4;
    const radius = Math.min(width, height) * 0.34;
    const levelFactor = 0.45 + 0.55 * (smoothLevel / 30);
    const loop = (particle, index) => {
      particle.life += dt;
      if (particle.life > particle.maxLife) reset(particle, false);
      const curl = Math.sin(particle.y * 16e-4 + time * 0.25 + particle.phase);
      particle.vx += curl * width * 0.02 * dt;
      particle.vy -= height * 8e-3 * dt;
      particle.vx += (Math.random() - 0.5) * width * 0.05 * dt;
      particle.vy += (Math.random() - 0.5) * height * 0.03 * dt;
      if (pointerX > -1e3) {
        const dx = pointerX - particle.x;
        const dy = pointerY - particle.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius && distance > 1e-3) {
          const falloff = 1 - distance / radius;
          const nx = dx / distance;
          const ny = dy / distance;
          if (repelling) {
            particle.vx -= nx * falloff * 900 * dt;
            particle.vy -= ny * falloff * 900 * dt;
          } else {
            particle.vx += nx * falloff * 90 * dt;
            particle.vy += ny * falloff * 90 * dt;
            particle.vx += -ny * falloff * 130 * dt;
            particle.vy += nx * falloff * 130 * dt;
          }
        }
      }
      const faceX = targetX * width;
      const faceY = targetY * height;
      const toFaceX = faceX - particle.x;
      const toFaceY = faceY - particle.y;
      const faceDistance = Math.hypot(toFaceX, toFaceY) || 1;
      const pull = 26 * dt * levelFactor;
      particle.vx += toFaceX / faceDistance * pull;
      particle.vy += toFaceY / faceDistance * pull;
      particle.vx *= Math.max(0, 1 - 0.8 * dt);
      particle.vy *= Math.max(0, 1 - 0.8 * dt);
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.y < -height * 0.15 || particle.x < -width * 0.1 || particle.x > width * 1.1) {
        reset(particle, false);
      }
      const warmth = smoothDark;
      const baseR = mix(cool[0], gold[0], warmth);
      const baseG = mix(cool[1], gold[1], warmth);
      const baseB = mix(cool[2], gold[2], warmth);
      const twinkle = 0.55 + 0.45 * Math.sin(particle.phase + time * 1.6);
      const lifeRatio = particle.life / particle.maxLife;
      const fadeIn = Math.min(1, lifeRatio / 0.18);
      const fade = fadeIn * Math.pow(Math.sin(Math.PI * clamp(lifeRatio, 0, 1)), 0.7);
      const finale = clamp((smoothLevel - 23) / 7, 0, 1);
      positions[index * 2] = particle.x;
      positions[index * 2 + 1] = particle.y;
      sizes[index] = particle.size * dpr * (0.8 + 0.4 * levelFactor) * (1 + 0.18 * finale);
      alphas[index] = clamp((0.3 + 0.42 * levelFactor) * (1 + 0.18 * finale) * twinkle * fade, 0, 1);
      colors[index * 3] = baseR;
      colors[index * 3 + 1] = baseG;
      colors[index * 3 + 2] = baseB;
      particle.phase += 0.02;
    };
    for (let i = 0; i < active; i += 1) loop(particles[i], i);
  };
  const upload = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions.subarray(0, active * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes.subarray(0, active), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas.subarray(0, active), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(alphaLocation);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors.subarray(0, active * 3), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
  };
  const sizeBuffer = gl.createBuffer();
  const alphaBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  if (sizeBuffer === null || alphaBuffer === null || colorBuffer === null) {
    return { setLevel() {
    }, start() {
    }, stop() {
    }, dispose() {
    } };
  }
  const render = () => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    upload();
    if (scaleLocation !== null && alphaLocationU !== null) {
      gl.uniform1f(scaleLocation, 2.6);
      gl.uniform1f(alphaLocationU, 0.2);
      gl.drawArrays(gl.POINTS, 0, active);
      gl.uniform1f(scaleLocation, 1);
      gl.uniform1f(alphaLocationU, 1);
    }
    gl.drawArrays(gl.POINTS, 0, active);
    display.clearRect(0, 0, canvas.width, canvas.height);
    display.drawImage(glCanvas, 0, 0, canvas.width, canvas.height);
  };
  const tick = (now) => {
    if (!running || disposed) return;
    frameHandle = requestAnimationFrame(tick);
    if (document.hidden) {
      last = now;
      return;
    }
    const delta = last === 0 ? 16 : Math.min(48, now - last);
    last = now;
    const dt = delta / 1e3;
    time += dt;
    smoothLevel = mix(smoothLevel, level, 0.06);
    smoothDark = mix(smoothDark, level >= 24 ? 1 : 0, 0.05);
    simulate(dt);
    render();
  };
  return {
    setTarget(x, y) {
      targetX = clamp(x / Math.max(1, window.innerWidth), 0.05, 0.95);
      targetY = clamp(y / Math.max(1, window.innerHeight), 0.05, 0.95);
    },
    setAnchor(x, y) {
      anchorX = clamp(x / Math.max(1, window.innerWidth), 0.05, 0.95);
      anchorY = clamp(y / Math.max(1, window.innerHeight), 0.05, 0.95);
    },
    setLevel(nextLevel) {
      level = clamp(nextLevel, 0, 30);
      if (reduceMotion) {
        smoothLevel = level;
        smoothDark = level >= 24 ? 1 : 0;
        simulate(0.016);
        render();
      }
    },
    start() {
      if (disposed || running) return;
      resize();
      if (particles.length === 0) {
        for (let i = 0; i < MAX_PARTICLES; i += 1) {
          const particle = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            t: 0,
            speed: 0.03,
            offset: 0,
            size: 3,
            phase: 0
          };
          reset(particle, true);
          particles.push(particle);
        }
      } else {
        for (const particle of particles) reset(particle, true);
      }
      window.addEventListener("resize", onResize);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, { passive: true });
      running = true;
      last = 0;
      smoothLevel = level;
      smoothDark = level >= 24 ? 1 : 0;
      if (reduceMotion) {
        simulate(0.016);
        render();
        return;
      }
      frameHandle = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (frameHandle !== 0) cancelAnimationFrame(frameHandle);
      frameHandle = 0;
      gl.clear(gl.COLOR_BUFFER_BIT);
      display.clearRect(0, 0, canvas.width, canvas.height);
    },
    dispose() {
      this.stop();
      disposed = true;
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(sizeBuffer);
      gl.deleteBuffer(alphaBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    }
  };
}

// src/client/tuner.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var TUNE_DEFAULTS = {
  idle: { opacity: 0.45, scale: 1.035, cut: 30, feather: 26.7 },
  running: { opacity: 0.85, scale: 1, cut: 20, feather: 40 },
  preview: { opacity: 1, scale: 1, cut: 10, feather: 40 },
  veil: { plateau: 72, a90: 0.9, a96: 0.7, edge: 0.12, ew: 46, eh: 80, cx: 75, cy: 36 },
  image: { objectY: 36, width: 42, brightness: 1.2, contrast: 1.05, scrim: 0.3 }
};
var KEY = "dsh-liang-tune.v5";
function applyTune(values) {
  const style = document.body.style;
  for (const id of ["idle", "running", "preview"]) {
    const state2 = values[id];
    style.setProperty(`--liang-tune-${id}-opacity`, String(state2.opacity));
    style.setProperty(`--liang-tune-${id}-scale`, String(state2.scale));
    style.setProperty(`--liang-tune-${id}-cut`, `${state2.cut}%`);
    style.setProperty(`--liang-tune-${id}-feather`, `${state2.feather}%`);
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
  const root = document.querySelector(".liang-skin-backdrop");
  const state = root?.dataset.preview === "true" ? "preview" : root?.dataset.engaged === "true" ? "running" : "idle";
  const current = values[state];
  const veilCss = `radial-gradient(ellipse ${veil.ew}% ${veil.eh}% at ${veil.cx}% ${veil.cy}%, #000 0%, #000 ${veil.plateau}%, rgba(0,0,0,0.97) 72%, rgba(0,0,0,0.86) 82%, rgba(0,0,0,${veil.a90}) 90%, rgba(0,0,0,${veil.a96}) 96%, rgba(0,0,0,${veil.edge}) 100%)`;
  for (const stack of Array.from(document.querySelectorAll(".liang-skin-portrait-stack"))) {
    stack.style.setProperty("--liang-veil", veilCss);
    stack.style.webkitMaskImage = veilCss;
    stack.style.maskImage = veilCss;
    stack.style.setProperty("--liang-corner-cut", `${current.cut}%`);
    stack.style.setProperty("--liang-corner-feather", `${current.feather}%`);
    stack.style.opacity = String(current.opacity);
    stack.style.transform = `scale(${current.scale})`;
    stack.style.filter = `brightness(${values.image.brightness}) contrast(${values.image.contrast})`;
    for (const frame of Array.from(stack.querySelectorAll("img.liang-skin-frame"))) {
      frame.style.objectPosition = `50% ${values.image.objectY}%`;
      frame.style.width = `min(${values.image.width}vw, 720px)`;
    }
  }
}
function loadTune() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return TUNE_DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...TUNE_DEFAULTS,
      ...parsed,
      veil: { ...TUNE_DEFAULTS.veil, ...parsed.veil },
      image: { ...TUNE_DEFAULTS.image, ...parsed.image }
    };
  } catch {
    return TUNE_DEFAULTS;
  }
}
var STATE_LABEL = {
  idle: "\u7A7A\u95F2",
  running: "\u8FDB\u884C\u4E2D",
  preview: "\u62D6\u52A8"
};
function LiangTuner({ onForce, liveState }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const [tab, setTab] = (0, import_react.useState)("idle");
  const [link, setLink] = (0, import_react.useState)(true);
  const [values, setValues] = (0, import_react.useState)(loadTune);
  (0, import_react.useEffect)(() => {
    applyTune(values);
    try {
      localStorage.setItem(KEY, JSON.stringify(values));
    } catch {
    }
    const host = window;
    if (host.__liangTunerTimer !== void 0) window.clearInterval(host.__liangTunerTimer);
    const timer = window.setInterval(() => applyTune(values), 400);
    host.__liangTunerTimer = timer;
    return () => {
      window.clearInterval(timer);
      if (host.__liangTunerTimer === timer) host.__liangTunerTimer = void 0;
    };
  }, [values]);
  const state = values[tab];
  const setState = (patch) => {
    setValues((current) => {
      if (!link) return { ...current, [tab]: { ...current[tab], ...patch } };
      const next = { ...current };
      for (const id of ["idle", "running", "preview"]) {
        next[id] = { ...next[id], ...patch };
      }
      return next;
    });
  };
  const setVeil = (patch) => {
    setValues((current) => ({ ...current, veil: { ...current.veil, ...patch } }));
  };
  const setImage = (patch) => {
    setValues((current) => ({ ...current, image: { ...current.image, ...patch } }));
  };
  const rows = (0, import_react.useMemo)(() => [
    { key: "opacity", label: "\u900F\u660E\u5EA6", min: 0, max: 1, step: 0.01, value: state.opacity, patch: (v) => setState({ opacity: v }) },
    { key: "scale", label: "\u7F29\u653E", min: 0.9, max: 1.1, step: 5e-3, value: state.scale, patch: (v) => setState({ scale: v }) },
    { key: "cut", label: "\u5706\u89D2 %", min: 0, max: 50, step: 1, value: state.cut, patch: (v) => setState({ cut: v }) },
    { key: "feather", label: "\u7FBD\u5316 %", min: 0, max: 100, step: 1, value: state.feather, patch: (v) => setState({ feather: v }) }
  ], [state, tab]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "liang-tuner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: "liang-tuner__toggle",
        title: "\u8C03\u6574\u80CC\u666F\u4EBA\u50CF\u53C2\u6570",
        "aria-label": "\u8C03\u6574\u80CC\u666F\u4EBA\u50CF\u53C2\u6570",
        "data-open": open ? "true" : "false",
        onClick: () => {
          const next = !open;
          setOpen(next);
          if (next) {
            const live = liveState();
            setTab(live);
            onForce(live);
          }
        },
        children: "\u2699"
      }
    ),
    open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "liang-tuner__panel", role: "dialog", "aria-label": "\u80CC\u666F\u4EBA\u50CF\u53C2\u6570", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "liang-tuner__head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u80CC\u666F\u4EBA\u50CF\u53C2\u6570" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setOpen(false), "aria-label": "\u5173\u95ED", children: "\xD7" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "liang-tuner__link", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: link, onChange: (event) => setLink(event.target.checked) }),
        "\u8054\u52A8\u4E09\u6001\uFF08\u6539\u4E00\u4E2A\uFF0C\u4E09\u4E2A\u4E00\u8D77\u53D8\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "liang-tuner__tabs", children: ["idle", "running", "preview"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          "data-active": tab === id ? "true" : "false",
          onClick: () => {
            setTab(id);
            onForce(id);
          },
          children: STATE_LABEL[id]
        },
        id
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "liang-tuner__rows", children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "liang-tuner__row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.label }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "range",
            min: row.min,
            max: row.max,
            step: row.step,
            value: row.value,
            onChange: (event) => row.patch(Number(event.target.value))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", { children: row.value.toFixed(row.step < 0.01 ? 3 : row.step < 1 ? 2 : 0) })
      ] }, row.key)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "liang-tuner__section", children: "\u9AD8\u65AF\u8499\u7248\uFF08\u4E09\u6001\u5171\u7528\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "liang-tuner__rows", children: [
        ["\u5E73\u53F0 %", values.veil.plateau, 40, 80, 1, (v) => setVeil({ plateau: v })],
        ["90% \u5904 \u03B1", values.veil.a90, 0, 1, 0.01, (v) => setVeil({ a90: v })],
        ["96% \u5904 \u03B1", values.veil.a96, 0, 1, 0.01, (v) => setVeil({ a96: v })],
        ["\u8FB9\u7F18 \u03B1", values.veil.edge, 0, 0.3, 5e-3, (v) => setVeil({ edge: v })],
        ["\u692D\u5706\u5BBD %", values.veil.ew, 20, 70, 1, (v) => setVeil({ ew: v })],
        ["\u692D\u5706\u9AD8 %", values.veil.eh, 30, 90, 1, (v) => setVeil({ eh: v })],
        ["\u4E2D\u5FC3 X %", values.veil.cx, 0, 100, 1, (v) => setVeil({ cx: v })],
        ["\u4E2D\u5FC3 Y %\uFF08\u5C0F=\u4E0A\uFF09", values.veil.cy, 0, 100, 1, (v) => setVeil({ cy: v })]
      ].map(([label, value, min, max, step, patch]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "liang-tuner__row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "range",
            min,
            max,
            step,
            value,
            onChange: (event) => patch(Number(event.target.value))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", { children: Number(value).toFixed(step < 0.01 ? 3 : step < 1 ? 2 : 0) })
      ] }, label)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "liang-tuner__section", children: "\u4EBA\u7269\u56FE" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "liang-tuner__rows", children: [
        ["\u5782\u76F4\u4F4D\u7F6E %", values.image.objectY, 0, 100, 1, (v) => setImage({ objectY: v })],
        ["\u5BBD\u5EA6 vw", values.image.width, 20, 70, 1, (v) => setImage({ width: v })],
        ["\u4EAE\u5EA6", values.image.brightness, 0.5, 2, 0.01, (v) => setImage({ brightness: v })],
        ["\u5BF9\u6BD4\u5EA6", values.image.contrast, 0.5, 2, 0.01, (v) => setImage({ contrast: v })],
        ["\u80CC\u666F\u538B\u6697", values.image.scrim, 0, 1, 0.01, (v) => setImage({ scrim: v })]
      ].map(([label, value, min, max, step, patch]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "liang-tuner__row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "range",
            min,
            max,
            step,
            value,
            onChange: (event) => patch(Number(event.target.value))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", { children: Number(value).toFixed(0) })
      ] }, label)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "liang-tuner__foot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            onClick: () => {
              const text = `/* liang tune */
${JSON.stringify(values, null, 2)}`;
              void navigator.clipboard?.writeText(text).catch(() => void 0);
            },
            children: "\u590D\u5236\u53C2\u6570"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setValues(TUNE_DEFAULTS), children: "\u91CD\u7F6E" })
      ] })
    ] })
  ] });
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
var LIANG_RANKS = ["\u5C0F\u96BE\u6881", "\u7262\u6881", "\u6881\u5B50", "\u6881\u5723", "\u6881\u795E", "\u6881\u7956"];
var STOPS = [
  { at: 0, page: [232, 233, 229], surface: [248, 248, 245], surface2: [238, 239, 235], ink: [23, 24, 22], secondary: [112, 116, 111], accent: [181, 43, 36], portraitOpacity: 0.92 },
  { at: 6, page: [211, 211, 206], surface: [239, 239, 234], surface2: [224, 224, 218], ink: [26, 26, 24], secondary: [101, 101, 96], accent: [181, 43, 36], portraitOpacity: 0.93 },
  { at: 12, page: [171, 168, 162], surface: [211, 208, 201], surface2: [190, 186, 179], ink: [27, 26, 24], secondary: [83, 79, 74], accent: [166, 54, 42], portraitOpacity: 0.94 },
  { at: 18, page: [117, 112, 106], surface: [154, 148, 140], surface2: [128, 122, 115], ink: [24, 22, 20], secondary: [65, 61, 56], accent: [154, 56, 42], portraitOpacity: 0.94 },
  { at: 24, page: [43, 39, 37], surface: [48, 43, 40], surface2: [58, 51, 46], ink: [244, 241, 232], secondary: [184, 180, 169], accent: [181, 92, 54], portraitOpacity: 0.94 },
  { at: 30, page: [17, 17, 17], surface: [30, 27, 25], surface2: [41, 35, 30], ink: [244, 241, 232], secondary: [184, 180, 169], accent: [193, 154, 73], portraitOpacity: 0.94 }
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
var FINE_STEPS = MAX_LEVEL;
var FRAMES_PER_STEP = PREVIEW_MAX_FRAME / FINE_STEPS;
function frameForLevel(level) {
  const safe = Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(0, Math.round(level))) : 0;
  return Math.round(safe / FINE_STEPS * PREVIEW_MAX_FRAME);
}
function levelForFrame(rawFrame) {
  return Math.round(clampFrame(rawFrame) / PREVIEW_MAX_FRAME * FINE_STEPS);
}
function snapFrame(rawFrame) {
  return frameForLevel(levelForFrame(rawFrame));
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
  const rank = options.withLevel === true ? `${liangRankForFrame(rawFrame)} ${levelForFrame(rawFrame)}` : liangRankForFrame(rawFrame);
  const effort = efforts[nearestEffortIndex(rawFrame, efforts)];
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
  return alpha === 1 ? `rgb(${value[0]} ${value[1]} ${value[2]})` : `rgb(${value[0]} ${value[1]} ${value[2]} / ${alpha})`;
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
    // visibly present. Dense controls use the opaque layer tokens below.
    base: rgb(page, dark ? 0.42 : 0.28),
    layer1: rgb(surface, 0.94),
    layer2: rgb(surface2, 0.96),
    layer3: rgb(surface2, 0.99),
    sidebar: rgb(sidebar, 0.96),
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
var import_jsx_runtime2 = require("react/jsx-runtime");
var PACKAGE_ID = "dsh-client-liang-intensity-skin";
var SHOW_TUNER = true;
var LOCALE_NAMESPACE = "liang.skin";
var ASSET_PREFIX = `/plugins/${PACKAGE_ID}/assets`;
var BIND_EFFORT_KEY = "dsh-liang-intensity-skin.bind-effort";
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
  theme;
  root;
  stack;
  layers;
  canvas;
  ambient;
  portraits;
  enabled = true;
  activeLayer = 1;
  currentUrl = null;
  clearTimer = null;
  // Default to the max frame so the first paint after load is the dark shell;
  // starting at 0 flashed the light palette before the directory resolved.
  frame = PREVIEW_MAX_FRAME;
  pendingFrame = PREVIEW_MAX_FRAME;
  raf = 0;
  disposed = false;
  unsubscribe;
  constructor(scope, theme) {
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
        url: `${ASSET_PREFIX}/portrait-source-xianxia-v2/${file}`
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
      }
    });
    window.addEventListener("resize", () => this.syncAnchor());
    this.unsubscribe = scope.subscribe(() => this.syncSettings());
    this.syncSettings();
  }
  /** Crossfade between decoded frames so a level change never hard-cuts. */
  showPortrait(url) {
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
  syncSettings() {
    this.setEnabled(this.scope.getSnapshot().enabled);
  }
  /** Aim the plume at the active portrait's face. */
  syncTarget() {
    const frame = this.layers.find((layer) => layer.dataset.active === "true");
    if (frame === void 0) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return;
    this.ambient.setTarget(rect.left + rect.width * 0.5, rect.top + rect.height * 0.38);
  }
  /** Spill particles from the composer's lower-left corner. */
  syncAnchor() {
    const input = document.querySelector('[contenteditable="true"]');
    if (input === null) return;
    const rect = input.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 10) return;
    this.ambient.setAnchor(rect.right - 22, rect.bottom - 6);
    this.syncTarget();
  }
  /** Reveal the immortal only while the turn is running; idle returns to the void. */
  setEngaged(engaged) {
    if (this.disposed) return;
    this.root.dataset.engaged = engaged ? "true" : "false";
  }
  /** Which portrait state is currently on screen. */
  getTuneState() {
    if (this.root.dataset.preview === "true") return "preview";
    if (this.root.dataset.engaged === "true") return "running";
    return "idle";
  }
  /** While the user drags the slider the portrait shows at full strength. */
  setPreviewing(previewing) {
    if (this.disposed) return;
    this.root.dataset.preview = previewing ? "true" : "false";
  }
  isEnabled() {
    return this.enabled;
  }
  getFrame() {
    return this.frame;
  }
  setEnabled(enabled) {
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
  syncNativeTheme(theme = paletteForFrame(this.frame).stage === 5 ? "dark" : "light") {
    if (!this.enabled || this.theme.getTheme().preference === theme) return;
    this.theme.setTheme(theme);
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
};
function useSessionRunning(session) {
  const subscribe = (listener) => session?.subscribe(listener) ?? (() => {
  });
  const getSnapshot = () => session?.getSnapshot() ?? null;
  const snapshot = (0, import_react2.useSyncExternalStore)(subscribe, getSnapshot);
  return snapshot?.running === true;
}
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
function LiangEffortSlider({ directory, load, select, presenter, scope, session }) {
  const state = (0, import_react2.useSyncExternalStore)(
    (listener) => directory.subscribe(listener),
    () => directory.getSnapshot()
  );
  const skin = (0, import_react2.useSyncExternalStore)(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot()
  );
  const reasoning = (0, import_react2.useMemo)(() => modelReasoning(state), [state]);
  const efforts = reasoning?.efforts ?? [];
  const committedIndex = selectedEffortIndex(
    efforts,
    reasoning?.selection.reasoningEffort,
    reasoning?.defaultEffort
  );
  const committedFrame = committedIndex < 0 ? PREVIEW_MAX_FRAME : frameForEffort(committedIndex, efforts.length);
  const bindEffort = skin.bindEffort;
  const [frame, setFrame] = (0, import_react2.useState)(() => bindEffort ? committedFrame : presenter.getFrame());
  const [pending, setPending] = (0, import_react2.useState)(false);
  const [failed, setFailed] = (0, import_react2.useState)(false);
  const [interacting, setInteracting] = (0, import_react2.useState)(false);
  const dragging = (0, import_react2.useRef)(false);
  const dragStartFrame = (0, import_react2.useRef)(frame);
  const selfCommitted = (0, import_react2.useRef)(-1);
  const lastCommitted = (0, import_react2.useRef)(committedIndex);
  const enabled = skin.enabled;
  const running = useSessionRunning(session);
  (0, import_react2.useEffect)(() => {
    if (enabled) load();
  }, [enabled, load]);
  (0, import_react2.useEffect)(() => {
    presenter.setEngaged(running);
  }, [presenter, running]);
  (0, import_react2.useEffect)(() => () => presenter.setEngaged(false), [presenter]);
  (0, import_react2.useEffect)(() => {
    const previous = lastCommitted.current;
    lastCommitted.current = committedIndex;
    if (!bindEffort || dragging.current || pending) return;
    if (state.status === "selecting") return;
    if (committedIndex < 0 && selfCommitted.current >= 0) return;
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
  const commit = async (rawFrame) => {
    if (!bindEffort) {
      dragging.current = false;
      setFrame(rawFrame);
      presenter.setFrame(rawFrame);
      return;
    }
    const targetFrame = snapFrame(rawFrame);
    const targetIndex = nearestEffortIndex(targetFrame, efforts);
    const target = efforts[targetIndex];
    if (target === void 0) return;
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
      reasoningEffort: target.id
    });
    setPending(false);
    if (!accepted) {
      setFailed(true);
      setFrame(committedFrame);
      presenter.setFrame(committedFrame);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: "liang-effort-control",
      "data-plugin": PACKAGE_ID,
      "data-state": failed ? "error" : pending ? "pending" : "ready",
      title: bindEffort ? previewEffort?.name : void 0,
      children: [
        interacting && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "output",
          {
            className: "liang-effort-control__tooltip",
            style: { "--liang-slider-ratio": progressRatio },
            children: tooltipLabel
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-effort-control__ticks", "aria-hidden": "true", children: [
          Array.from({ length: FINE_STEPS + 1 }, (_, level) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "i",
            {
              className: "liang-effort-control__tick liang-effort-control__tick--minor",
              style: { left: `${frameForLevel(level) / PREVIEW_MAX_FRAME * 100}%` }
            },
            `fine-${level}`
          )),
          efforts.map((effort, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "i",
            {
              className: "liang-effort-control__tick",
              style: { left: `${frameForEffort(index, efforts.length) / PREVIEW_MAX_FRAME * 100}%` }
            },
            effort.id
          ))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            className: "liang-effort-control__range",
            type: "range",
            min: 0,
            max: PREVIEW_MAX_FRAME,
            step: 1,
            value: frame,
            disabled: pending || state.status === "selecting",
            "aria-label": bindEffort ? "\u601D\u8003\u7B49\u7EA7" : "\u76AE\u80A4\u8FDB\u5EA6",
            "aria-valuetext": bindEffort ? previewEffort?.name ?? "" : tooltipLabel,
            onPointerDown: () => {
              dragging.current = true;
              dragStartFrame.current = frame;
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
            onPointerCancel: () => {
              setInteracting(false);
              presenter.setPreviewing(false);
              dragging.current = false;
              setFrame(dragStartFrame.current);
              presenter.setFrame(dragStartFrame.current);
            },
            onKeyUp: (event) => {
              setInteracting(false);
              presenter.setPreviewing(false);
              if (event.key !== "Escape") void commit(Number(event.currentTarget.value));
            },
            onBlur: (event) => {
              setInteracting(false);
              if (dragging.current) void commit(Number(event.currentTarget.value));
            },
            onKeyDown: (event) => {
              setInteracting(true);
              if (event.key === "Escape" && !pending) {
                setInteracting(false);
                dragging.current = false;
                setFrame(dragStartFrame.current);
                presenter.setFrame(dragStartFrame.current);
              }
            }
          }
        ),
        SHOW_TUNER && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          LiangTuner,
          {
            liveState: () => presenter.getTuneState(),
            onForce: (state2) => {
              if (state2 === "idle") {
                presenter.setPreviewing(false);
                presenter.setEngaged(false);
              } else if (state2 === "running") {
                presenter.setPreviewing(false);
                presenter.setEngaged(true);
              } else {
                presenter.setEngaged(true);
                presenter.setPreviewing(true);
              }
            }
          }
        )
      ]
    }
  );
}
function EffortBindingRow({ scope, t }) {
  const snapshot = (0, import_react2.useSyncExternalStore)(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot()
  );
  const [pending, setPending] = (0, import_react2.useState)(false);
  if (!snapshot.enabled) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "liang-appearance-binding", "data-plugin": PACKAGE_ID, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("effort.binding") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_dsh_client_ui_primitives.Switch,
      {
        checked: snapshot.bindEffort,
        disabled: pending,
        label: t("effort.binding"),
        onChange: (next) => {
          if (pending) return;
          setPending(true);
          void scope.setBindEffort(next).catch(() => void 0).finally(() => setPending(false));
        }
      }
    )
  ] });
}
var inject = [
  "slots",
  "sessions",
  "modelDirectories",
  "locale",
  "theme"
];
function createPreferenceStore() {
  try {
    localStorage.removeItem("dsh-liang-intensity-skin.enabled");
  } catch {
  }
  let snapshot = {
    enabled: true,
    bindEffort: localStorage.getItem(BIND_EFFORT_KEY) !== "0"
  };
  const listeners = /* @__PURE__ */ new Set();
  const onStorage = (event) => {
    if (event.key !== BIND_EFFORT_KEY) return;
    const next = {
      enabled: snapshot.enabled,
      bindEffort: event.newValue !== "0"
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
    }
  };
}
function apply(ctx) {
  for (const stale of Array.from(document.querySelectorAll(`style[data-plugin="${PACKAGE_ID}"]`))) {
    stale.remove();
  }
  const style = document.createElement("style");
  style.dataset.plugin = PACKAGE_ID;
  style.textContent = skin_default;
  document.head.append(style);
  ctx.effect(() => () => style.remove(), "liang-intensity-skin: scoped styles");
  const scope = createPreferenceStore();
  ctx.effect(() => () => scope.dispose(), "liang-intensity-skin: appearance preference");
  const theme = ctx.get("theme");
  const presenter = new SkinPresenter(scope, theme);
  ctx.effect(() => () => presenter.dispose(), "liang-intensity-skin: backdrop presenter");
  ctx.effect(
    () => installLiangAppearanceButton(scope, presenter, PACKAGE_ID),
    "liang-intensity-skin: native appearance extension"
  );
  ctx.effect(
    () => ctx.locale.register(LOCALE_NAMESPACE, {
      zh: { "effort.binding": "\u6ED1\u52A8\u53D8\u7956\u7ED1\u5B9A\u601D\u8003\u7B49\u7EA7" },
      en: { "effort.binding": "Bind slider to reasoning level" }
    }),
    "liang-intensity-skin: settings locale"
  );
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "liang-effort-binding",
    order: 10.5,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ scope })
  }, EffortBindingRow));
  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "liang-intensity-control",
    order: 10,
    inject: (sessionId) => {
      const available = ctx.sessions.subagentAddress(sessionId) === void 0;
      const directory = ctx.modelDirectories.directoryFor(sessionId);
      const scopeCtx = ctx.sessions.scope?.(sessionId);
      const session = scopeCtx === void 0 ? void 0 : ctx.sessions.sessionOf?.(scopeCtx);
      return {
        directory: directory.store,
        presenter,
        scope,
        session,
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
