(() => {
  const body = document.body;
  const html = document.documentElement;
  const root = document.querySelector("#root");
  const backdrop = document.querySelector(".liang-skin-backdrop");
  const portrait = backdrop?.querySelector("img");
  const bodyStyle = body ? getComputedStyle(body) : null;
  const vars = [
    "--liang-page", "--liang-bg-base", "--liang-mask-base",
    "--liang-mask-strong", "--liang-mask-soft", "--liang-layer-1",
    "--liang-layer-2", "--liang-layer-3", "--liang-sidebar",
    "--liang-portrait-opacity",
  ];

  const describe = (element) => {
    if (!element) return null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const className = typeof element.className === "string" ? element.className : "";
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: className.split(/\s+/).filter(Boolean).slice(0, 8),
      rect: [rect.x, rect.y, rect.width, rect.height]
        .map((value) => Math.round(value * 10) / 10),
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      position: style.position,
      zIndex: style.zIndex,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage === "none"
        ? null
        : style.backgroundImage.slice(0, 220),
      isolation: style.isolation,
      maskImage: style.maskImage === "none" ? null : style.maskImage.slice(0, 220),
    };
  };

  const findByClassPart = (part) => [...document.querySelectorAll("#root *")]
    .find((element) => [...element.classList].some((name) => name.includes(part)));
  const centerColumn = document.querySelector('[data-pane="conversation"]')
    ?? document.querySelector('[class*="centerCol"]');
  const hostFrame = findByClassPart("_frame");
  const pseudo = backdrop ? getComputedStyle(backdrop, "::after") : null;
  const points = [
    [Math.max(1, innerWidth - 80), Math.max(1, Math.floor(innerHeight / 2))],
    [Math.max(1, Math.floor(innerWidth * 0.72)), Math.max(1, Math.floor(innerHeight * 0.72))],
  ];
  const stacks = points.map(([x, y]) => ({
    point: [x, y],
    elements: document.elementsFromPoint(x, y).slice(0, 10).map(describe),
  }));

  const cssProbe = document.createElement("div");
  cssProbe.style.setProperty("--dsh-test-color", "rgba(255, 255, 255, 0.94)");
  cssProbe.style.background = "var(--dsh-test-color)";
  body?.append(cssProbe);
  const cssProbeBackground = getComputedStyle(cssProbe).backgroundColor;
  cssProbe.remove();

  const safePath = (value) => {
    if (!value) return null;
    try { return new URL(value, location.href).pathname; } catch { return null; }
  };
  const report = {
    diagnostic: "dsh-liang-diagnostic",
    collectedAt: new Date().toISOString(),
    location: location.origin,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    electron: typeof process !== "undefined" && process.versions ? {
      electron: process.versions.electron ?? null,
      chrome: process.versions.chrome ?? null,
      node: process.versions.node ?? null,
    } : null,
    document: {
      htmlData: {
        platform: html.dataset.platform ?? null,
        windowsTitlebar: html.hasAttribute("data-windows-titlebar"),
      },
      bodyData: {
        liangSkin: body?.dataset.liangSkin ?? null,
        liangStage: body?.dataset.liangStage ?? null,
        desktopMode: body?.dataset.dshDesktopMode ?? null,
        darkTheme: body?.hasAttribute("data-ds-dark-theme") ?? false,
      },
    },
    cssSupports: {
      rgbSpaceAlpha: CSS.supports("background-color", "rgb(255 255 255 / 94%)"),
      rgba: CSS.supports("background-color", "rgba(255, 255, 255, .94)"),
      colorMix: CSS.supports("color", "color-mix(in srgb, red 50%, transparent)"),
      maskImage: CSS.supports("mask-image", "linear-gradient(black, transparent)"),
      hasSelector: CSS.supports("selector(:has(*))"),
      customPropertyAlphaResult: cssProbeBackground,
    },
    variables: Object.fromEntries(vars.map((name) => [
      name,
      bodyStyle?.getPropertyValue(name).trim() ?? null,
    ])),
    nodes: {
      body: describe(body),
      root: describe(root),
      hostFrame: describe(hostFrame),
      centerColumn: describe(centerColumn),
      backdrop: describe(backdrop),
      scrim: pseudo ? {
        display: pseudo.display,
        backgroundImage: pseudo.backgroundImage === "none"
          ? null
          : pseudo.backgroundImage.slice(0, 300),
      } : null,
      portrait: {
        ...describe(portrait),
        srcPath: safePath(portrait?.currentSrc || portrait?.src),
        naturalWidth: portrait?.naturalWidth ?? null,
        naturalHeight: portrait?.naturalHeight ?? null,
        complete: portrait?.complete ?? null,
      },
    },
    stacks,
  };

  const output = JSON.stringify(report, null, 2);
  console.log("[dsh-liang-diagnostic]\n" + output);
  if (typeof copy === "function") copy(output);
  return report;
})()
