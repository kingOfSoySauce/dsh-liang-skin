import { afterEach, describe, expect, it, vi } from "vitest";
import { createAmbient } from "./ambient";

class Events {
  readonly listeners = new Map<string, Set<(event: any) => void>>();
  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }
  removeEventListener(type: string, listener: (event: any) => void) {
    this.listeners.get(type)?.delete(listener);
  }
  emit(type: string, event: any = {}) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
  }
  listenerCount() {
    return [...this.listeners.values()].reduce((count, entries) => count + entries.size, 0);
  }
}

function harness(options: {
  reduced?: boolean;
  display?: boolean;
  webgl?: boolean;
  compile?: boolean;
  link?: boolean;
  failBuffer?: number;
  missingUniform?: boolean;
} = {}) {
  const doc = Object.assign(new Events(), { hidden: false });
  const media = Object.assign(new Events(), { matches: options.reduced ?? false });
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  const observers: { callback: () => void; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const view = Object.assign(new Events(), {
    devicePixelRatio: 1,
    // Intentionally much larger than the stage: viewport dimensions are not
    // valid particle dimensions once the backdrop lives in the center column.
    innerWidth: 1600,
    innerHeight: 1000,
    performance: { now: () => 100 },
    matchMedia: vi.fn(() => media),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    }),
    cancelAnimationFrame: vi.fn((id: number) => frames.delete(id)),
    ResizeObserver: class {
      readonly observe = vi.fn();
      readonly disconnect = vi.fn();
      constructor(readonly callback: () => void) { observers.push(this); }
    },
  });
  let resourceId = 0;
  let bufferCount = 0;
  const loseContext = vi.fn();
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
    ARRAY_BUFFER: 5, DYNAMIC_DRAW: 6, FLOAT: 7, COLOR_BUFFER_BIT: 8,
    BLEND: 9, SRC_ALPHA: 10, ONE: 11, DEPTH_TEST: 12, POINTS: 13,
    createShader: vi.fn(() => ({ id: ++resourceId })),
    shaderSource: vi.fn(), compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => options.compile !== false),
    createProgram: vi.fn(() => ({ id: ++resourceId })),
    attachShader: vi.fn(), linkProgram: vi.fn(), useProgram: vi.fn(),
    getProgramParameter: vi.fn(() => options.link !== false),
    createBuffer: vi.fn(() => ++bufferCount === options.failBuffer ? null : ({ id: ++resourceId })),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => options.missingUniform ? null : ({ id: ++resourceId })),
    deleteBuffer: vi.fn(), deleteProgram: vi.fn(), deleteShader: vi.fn(),
    getExtension: vi.fn(() => ({ loseContext })),
    viewport: vi.fn(), uniform2f: vi.fn(), uniform1f: vi.fn(),
    bindBuffer: vi.fn(), bufferData: vi.fn(), enableVertexAttribArray: vi.fn(), vertexAttribPointer: vi.fn(),
    clearColor: vi.fn(), clear: vi.fn(), enable: vi.fn(), blendFunc: vi.fn(), disable: vi.fn(), drawArrays: vi.fn(),
  };
  const display = { clearRect: vi.fn(), drawImage: vi.fn() };
  const gpuCanvas = Object.assign(new Events(), {
    width: 300, height: 150,
    getContext: vi.fn(() => options.webgl === false ? null : gl),
  });
  const rect = { left: 250, top: 80, width: 400, height: 300 };
  const canvas = {
    ownerDocument: Object.assign(doc, { defaultView: view, createElement: vi.fn(() => gpuCanvas) }),
    width: 300, height: 150,
    getContext: vi.fn(() => options.display === false ? null : display),
    getBoundingClientRect: vi.fn(() => rect),
  };
  const effect = createAmbient(canvas as unknown as HTMLCanvasElement);
  const frame = (now = 16) => {
    const entry = frames.entries().next().value as [number, FrameRequestCallback] | undefined;
    if (entry === undefined) throw new Error("No scheduled frame");
    frames.delete(entry[0]);
    entry[1](now);
  };
  const motion = (matches: boolean) => { media.matches = matches; media.emit("change", { matches }); };
  return { effect, canvas, gpuCanvas, doc, view, media, frames, frame, motion, gl, display, rect, observers, loseContext };
}

afterEach(() => vi.restoreAllMocks());

describe("optional particle ownership", () => {
  it("does no animation or event work until start, owns one RAF, and releases everything once", () => {
    const h = harness();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount()).toBe(0);
    h.effect.start();
    h.effect.start();
    expect(h.frames.size).toBe(1);
    h.frame();
    expect(h.frames.size).toBe(1);
    expect(h.gl.drawArrays).toHaveBeenCalledTimes(2);
    const lateFrame = [...h.frames.values()][0];
    h.effect.dispose();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount() + h.gpuCanvas.listenerCount()).toBe(0);
    expect(h.observers[0].disconnect).toHaveBeenCalledOnce();
    expect(h.gl.deleteBuffer).toHaveBeenCalledTimes(4);
    expect(h.gl.deleteProgram).toHaveBeenCalledOnce();
    expect(h.gl.deleteShader).toHaveBeenCalledTimes(2);
    expect(h.loseContext).toHaveBeenCalledOnce();
    expect([h.canvas.width, h.canvas.height, h.gpuCanvas.width, h.gpuCanvas.height]).toEqual([0, 0, 0, 0]);
    h.effect.dispose();
    h.effect.start();
    h.effect.setLevel(30, true);
    lateFrame(32);
    expect(h.frames.size).toBe(0);
    expect(h.gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(h.loseContext).toHaveBeenCalledOnce();
  });

  it("pauses without a pending RAF when hidden and follows live reduced-motion changes", () => {
    const h = harness();
    h.effect.start();
    h.doc.hidden = true;
    h.doc.emit("visibilitychange");
    expect(h.frames.size).toBe(0);
    h.effect.setLevel(10, false);
    expect(h.gl.drawArrays).not.toHaveBeenCalled();
    h.doc.hidden = false;
    h.doc.emit("visibilitychange");
    expect(h.frames.size).toBe(1);
    h.motion(true);
    expect(h.frames.size).toBe(0);
    expect(h.gl.drawArrays).toHaveBeenCalledTimes(2); // One still, no animation loop.
    h.effect.setLevel(30, true);
    expect(h.frames.size).toBe(0);
    expect(h.gl.drawArrays).toHaveBeenCalledTimes(4);
    h.motion(false);
    expect(h.frames.size).toBe(1);
    h.effect.stop();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount()).toBe(0);
    h.doc.emit("visibilitychange");
    h.motion(false);
    expect(h.frames.size).toBe(0);
    h.effect.dispose();
  });

  it("starts hidden or in reduced-motion mode without scheduling an animation", () => {
    const h = harness({ reduced: true });
    h.doc.hidden = true;
    h.effect.start();
    expect(h.frames.size).toBe(0);
    expect(h.gl.drawArrays).not.toHaveBeenCalled();
    h.doc.hidden = false;
    h.doc.emit("visibilitychange");
    expect(h.frames.size).toBe(0);
    expect(h.gl.drawArrays).toHaveBeenCalledTimes(2);
    h.effect.dispose();
  });

  it("uses stage dimensions and translates viewport anchors to local pixels", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const h = harness();
    h.effect.setAnchor(450, 280); // (200, 200) inside the offset stage.
    h.effect.setTarget(450, 280);
    h.effect.setLevel(0, false);
    h.effect.start();
    expect([h.canvas.width, h.canvas.height]).toEqual([400, 300]);
    h.frame();
    const data = h.gl.bufferData.mock.calls[0][1] as Float32Array;
    expect(data[0]).toBeGreaterThan(195);
    expect(data[0]).toBeLessThan(205);
    expect(data[1]).toBeGreaterThan(195);
    expect(data[1]).toBeLessThan(205);
    h.view.devicePixelRatio = 2;
    h.rect.width = 500;
    h.observers[0].callback();
    expect([h.canvas.width, h.canvas.height]).toEqual([750, 450]);
    h.effect.dispose();
  });

  it("does not loop for a zero-sized stage and resumes after a container resize", () => {
    const h = harness();
    h.rect.width = 0;
    h.effect.start();
    expect(h.frames.size).toBe(0);
    h.rect.width = 400;
    h.observers[0].callback();
    expect(h.frames.size).toBe(1);
    h.effect.stop();
    expect(h.frames.size).toBe(0);
    h.effect.start();
    expect(h.frames.size).toBe(1);
    h.effect.dispose();
    expect(h.observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it.each([
    { compile: false, shaders: 1, buffers: 0, programs: 0 },
    { link: false, shaders: 2, buffers: 0, programs: 1 },
    { failBuffer: 2, shaders: 2, buffers: 1, programs: 1 },
    { missingUniform: true, shaders: 2, buffers: 4, programs: 1 },
  ])("cleans partial GPU initialization and returns a complete inert handle: %j", (options) => {
    const h = harness(options);
    expect(() => {
      h.effect.setLevel(30, true);
      h.effect.setAnchor(500, 250);
      h.effect.setTarget(500, 250);
      h.effect.start();
      h.effect.stop();
      h.effect.dispose();
    }).not.toThrow();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount()).toBe(0);
    expect(h.gl.deleteShader).toHaveBeenCalledTimes(options.shaders);
    expect(h.gl.deleteBuffer).toHaveBeenCalledTimes(options.buffers);
    expect(h.gl.deleteProgram).toHaveBeenCalledTimes(options.programs);
    expect(h.loseContext).toHaveBeenCalledOnce();
  });

  it.each([{ display: false }, { webgl: false }])("handles a missing canvas context without listeners: %j", (options) => {
    const h = harness(options);
    h.effect.start();
    h.effect.setAnchor(1, 2);
    h.effect.setTarget(3, 4);
    h.effect.setLevel(20, false);
    h.effect.dispose();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount()).toBe(0);
  });

  it("permanently stops and releases resources after WebGL context loss", () => {
    const h = harness();
    h.effect.start();
    const preventDefault = vi.fn();
    h.gpuCanvas.emit("webglcontextlost", { preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount() + h.gpuCanvas.listenerCount()).toBe(0);
    expect(h.loseContext).toHaveBeenCalledOnce();
    h.effect.start();
    expect(h.frames.size).toBe(0);
  });

  it("does not leak a successor RAF or resources when a renderer throws", () => {
    const h = harness();
    h.effect.start();
    h.gl.drawArrays.mockImplementationOnce(() => { throw new Error("Lost rendering surface"); });
    expect(() => h.frame()).not.toThrow();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount() + h.gpuCanvas.listenerCount()).toBe(0);
    expect(h.loseContext).toHaveBeenCalledOnce();
    h.effect.start();
    expect(h.frames.size).toBe(0);
  });

  it("releases a context that fails while sizing before the first frame", () => {
    const h = harness();
    h.gl.viewport.mockImplementationOnce(() => { throw new Error("Lost context during resize"); });
    expect(() => h.effect.start()).not.toThrow();
    expect(h.frames.size).toBe(0);
    expect(h.view.listenerCount() + h.doc.listenerCount() + h.media.listenerCount()).toBe(0);
    expect(h.loseContext).toHaveBeenCalledOnce();
  });
});
