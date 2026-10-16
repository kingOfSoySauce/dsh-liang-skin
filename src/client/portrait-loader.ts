export interface PortraitSource {
  level: number;
  url: string;
}

export interface PortraitState {
  index: number | null;
  url: string | null;
  status: "loading" | "ready" | "failed";
  image: PortraitImage | null;
}

export interface PortraitImage {
  src: string;
  loading: "eager" | "lazy";
  decoding: "async" | "sync" | "auto";
  decode(): Promise<void>;
  addEventListener(type: "load" | "error", listener: () => void): void;
  removeEventListener(type: "load" | "error", listener: () => void): void;
  removeAttribute(name: string): void;
}

export interface PortraitLoaderOptions {
  sources: readonly PortraitSource[];
  onChange: (state: PortraitState) => void;
  createImage?: () => PortraitImage;
}

interface Asset {
  url: string;
  status: "idle" | "loading" | "ready" | "failed";
  loadedUrl: string | null;
  retries: number;
  image: PortraitImage | null;
  timer: ReturnType<typeof setTimeout> | null;
  detach: (() => void) | null;
}

const RETRY_DELAYS = [500, 1500, 3000] as const;

function retryUrl(source: string, retry: number) {
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

/**
 * Decode frames independently and return the decoded image itself for display.
 * start() resumes after stop(); stop() silently releases every request/image.
 * dispose() is permanent. select() also accepts a target before start().
 */
export function createPortraitLoader(options: PortraitLoaderOptions) {
  const sources = options.sources.map((source) => ({ ...source }));
  const assets = new Map<string, Asset>();
  for (const { url } of sources) {
    if (!assets.has(url)) {
      assets.set(url, {
        url, status: "idle", loadedUrl: null, retries: 0,
        image: null, timer: null, detach: null,
      });
    }
  }
  const createImage = options.createImage ?? (() => new Image());
  let onChange: PortraitLoaderOptions["onChange"] | null = options.onChange;
  let active = false;
  let disposed = false;
  let generation = 0;
  let targetLevel = sources[0]?.level ?? 0;
  let displayedIndex: number | null = null;
  let lastState: PortraitState | null = null;

  const isCurrent = (run: number) => active && !disposed && generation === run;
  const nearestIndex = (available: (index: number) => boolean) => {
    let nearest: number | null = null;
    for (let index = 0; index < sources.length; index += 1) {
      if (!available(index)) continue;
      const distance = Math.abs(sources[index].level - targetLevel);
      const previous = nearest === null ? Infinity : Math.abs(sources[nearest].level - targetLevel);
      if (nearest === null || distance < previous || (distance === previous && sources[index].level > sources[nearest].level)) {
        nearest = index;
      }
    }
    return nearest;
  };
  const isReady = (index: number) => assets.get(sources[index].url)?.status === "ready";
  const emit = (state: PortraitState) => {
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
      const asset = assets.get(sources[displayedIndex].url)!;
      emit({ index: displayedIndex, url: asset.loadedUrl, image: asset.image, status: "ready" });
    } else {
      const exhausted = [...assets.values()].every((asset) => asset.status === "failed");
      emit({ index: null, url: null, image: null, status: exhausted ? "failed" : "loading" });
    }
  };

  const request = (asset: Asset, run: number) => {
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
    select(level: number) {
      if (disposed || !Number.isFinite(level)) return;
      targetLevel = level;
      reconcile();
    },
    stop,
    dispose() {
      stop();
      disposed = true;
      onChange = null;
    },
  };
}
