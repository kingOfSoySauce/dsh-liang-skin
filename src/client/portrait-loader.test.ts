import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPortraitLoader, type PortraitImage, type PortraitState } from "./portrait-loader";

class FakeImage implements PortraitImage {
  loading: "eager" | "lazy" = "eager";
  decoding: "async" | "sync" | "auto" = "async";
  private source = "";
  readonly requests: string[] = [];
  readonly listeners = new Map<string, Set<() => void>>();
  resolveDecode!: () => void;
  rejectDecode!: (reason?: unknown) => void;
  private readonly decoded = new Promise<void>((resolve, reject) => {
    this.resolveDecode = resolve;
    this.rejectDecode = reject;
  });
  get src() { return this.source; }
  set src(value: string) { this.source = value; this.requests.push(value); }
  decode() { return this.decoded; }
  addEventListener(type: "load" | "error", listener: () => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }
  removeEventListener(type: "load" | "error", listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }
  removeAttribute(name: string) { if (name === "src") this.source = ""; }
  emit(type: "load" | "error") {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener();
  }
  async succeed() {
    this.emit("load");
    this.resolveDecode();
    await Promise.resolve();
  }
  listenerCount() {
    return [...this.listeners.values()].reduce((total, entries) => total + entries.size, 0);
  }
}

function harness(urls = ["/portrait-0.webp", "/portrait-10.webp", "/portrait-20.webp"]) {
  const images: FakeImage[] = [];
  const states: PortraitState[] = [];
  const loader = createPortraitLoader({
    sources: urls.map((url, index) => ({ level: index * 10, url })),
    createImage: () => {
      const image = new FakeImage();
      images.push(image);
      return image;
    },
    onChange: (state) => states.push(state),
  });
  return { loader, images, states, state: () => states.at(-1) };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("portrait loading recovery", () => {
  it("shows each decoded frame without waiting for other requests or decodes", async () => {
    const { loader, images, state } = harness();
    loader.select(20);
    loader.start();
    images[0].emit("load"); // Leave this decode pending.
    await images[1].succeed();
    expect(state()).toEqual({ index: 1, url: "/portrait-10.webp", image: images[1], status: "ready" });
    images[2].emit("error");
    await vi.advanceTimersByTimeAsync(500);
    await images[3].succeed();
    expect(state()).toEqual({ index: 2, url: "/portrait-20.webp?retry=1", image: images[3], status: "ready" });
    loader.dispose();
  });

  it("keeps the displayed frame until the requested target becomes available", async () => {
    const { loader, images, state } = harness();
    loader.start();
    await images[0].succeed();
    loader.select(20);
    await images[1].succeed();
    expect(state()?.index).toBe(0);
    await images[2].succeed();
    expect(state()?.index).toBe(2);
    loader.select(5); // Midpoint follows the upper anchor, like portraitBlendForLevel.
    expect(state()?.index).toBe(1);
    loader.dispose();
  });

  it("limits each URL to three retries with the required backoff and cache keys", async () => {
    const { loader, images, state } = harness(["/portrait.webp?size=2#frame"]);
    loader.start();
    images[0].emit("error");
    for (const [attempt, delay] of [500, 1500, 3000].entries()) {
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(images).toHaveLength(attempt + 1);
      await vi.advanceTimersByTimeAsync(1);
      expect(images[attempt + 1].src).toBe(`/portrait.webp?size=2&retry=${attempt + 1}#frame`);
      images[attempt + 1].emit("error");
    }
    expect(state()).toEqual({ index: null, url: null, image: null, status: "failed" });
    await vi.runAllTimersAsync();
    expect(images).toHaveLength(4);
    expect(images.every((image) => image.src === "" && image.listenerCount() === 0)).toBe(true);
    loader.dispose();
  });

  it("falls back to color only after all frame requests exhaust their retries", async () => {
    const { loader, images, state } = harness(["/a.webp", "/b.webp"]);
    loader.start();
    const failPending = () => images.filter((image) => image.src).forEach((image) => image.emit("error"));
    failPending();
    expect(state()?.status).toBe("loading");
    for (const delay of [500, 1500, 3000]) {
      await vi.advanceTimersByTimeAsync(delay);
      failPending();
    }
    expect(images).toHaveLength(8);
    expect(state()).toEqual({ index: null, url: null, image: null, status: "failed" });
    loader.dispose();
  });

  it("preserves a usable frame when another URL exhausts every retry", async () => {
    const { loader, images, state } = harness(["/a.webp", "/b.webp"]);
    loader.select(10);
    loader.start();
    await images[0].succeed();
    images[1].emit("error");
    for (const [attempt, delay] of [500, 1500, 3000].entries()) {
      await vi.advanceTimersByTimeAsync(delay);
      images[attempt + 2].emit("error");
    }
    expect(state()).toEqual({ index: 0, url: "/a.webp", image: images[0], status: "ready" });
    loader.dispose();
  });

  it("retries a decode failure and accepts a recovered target frame", async () => {
    const { loader, images, state } = harness(["/a.webp"]);
    loader.start();
    images[0].emit("load");
    images[0].rejectDecode(new Error("incomplete bitmap"));
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(500);
    await images[1].succeed();
    expect(state()).toEqual({ index: 0, url: "/a.webp?retry=1", image: images[1], status: "ready" });
    loader.dispose();
  });

  it("cancels retries and releases ready, decoding, and loading images on stop", async () => {
    const { loader, images, states } = harness();
    loader.start();
    await images[0].succeed();
    images[1].emit("load");
    images[2].emit("error");
    const beforeStop = states.length;
    loader.stop();
    expect(images.every((image) => image.src === "" && image.listenerCount() === 0)).toBe(true);
    images[1].resolveDecode();
    await vi.runAllTimersAsync();
    expect(images).toHaveLength(3);
    expect(states).toHaveLength(beforeStop);
    loader.dispose();
  });

  it("rejects stale decode results after stop and restart", async () => {
    const { loader, images, states, state } = harness(["/a.webp"]);
    loader.start();
    images[0].emit("load");
    loader.stop();
    loader.start();
    const restartedStates = states.length;
    images[0].resolveDecode();
    await Promise.resolve();
    expect(states).toHaveLength(restartedStates);
    expect(state()?.status).toBe("loading");
    await images[1].succeed();
    expect(state()?.status).toBe("ready");
    loader.dispose();
  });

  it("makes disposal permanent and ignores saved callbacks from cancelled attempts", async () => {
    const { loader, images, states } = harness(["/a.webp"]);
    loader.start();
    const staleLoad = [...images[0].listeners.get("load")!][0];
    const staleError = [...images[0].listeners.get("error")!][0];
    loader.dispose();
    const disposedStates = states.length;
    staleLoad();
    staleError();
    loader.select(10);
    loader.start();
    loader.dispose();
    await vi.runAllTimersAsync();
    expect(images).toHaveLength(1);
    expect(images[0].src).toBe("");
    expect(states).toHaveLength(disposedStates);
  });

  it("loads duplicate source URLs once while selecting their anchor levels", async () => {
    const { loader, images, state } = harness(["/shared.webp", "/shared.webp"]);
    loader.select(10);
    loader.start();
    loader.start();
    expect(images).toHaveLength(1);
    await images[0].succeed();
    expect(state()).toEqual({ index: 1, url: "/shared.webp", image: images[0], status: "ready" });
    loader.dispose();
  });

  it("handles an empty source list without creating image requests", () => {
    const { loader, images, state } = harness([]);
    loader.start();
    expect(images).toHaveLength(0);
    expect(state()).toEqual({ index: null, url: null, image: null, status: "failed" });
    loader.dispose();
  });
});
