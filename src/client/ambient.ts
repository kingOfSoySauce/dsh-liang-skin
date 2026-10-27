export interface AmbientHandle {
  setLevel(level: number, dark: boolean): void;
  /** Anchor and target accept viewport CSS pixels, like getBoundingClientRect. */
  setAnchor(x: number, y: number): void;
  setTarget(x: number, y: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  phase: number;
}

const MAX_PARTICLES = 3300;
const TAU = Math.PI * 2;
const VERTEX = `
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
const FRAGMENT = `
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function noopHandle(): AmbientHandle {
  return { setLevel() {}, setAnchor() {}, setTarget() {}, start() {}, stop() {}, dispose() {} };
}

/**
 * An explicitly owned particle effect. Nothing is instantiated on module load.
 * start/stop own every listener and RAF; dispose also releases the GPU context.
 */
export function createAmbient(canvas: HTMLCanvasElement): AmbientHandle {
  const doc = canvas.ownerDocument;
  const view = doc.defaultView;
  if (view === null) return noopHandle();
  let display: CanvasRenderingContext2D | null;
  let gl: WebGLRenderingContext | null = null;
  let glCanvas: HTMLCanvasElement | null = null;
  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  let program: WebGLProgram | null = null;
  let released = false;
  const release = (operation: () => void) => {
    try { operation(); } catch { /* Context loss must not prevent other cleanup. */ }
  };
  const releaseGPU = () => {
    if (released) return;
    released = true;
    if (gl !== null) {
      const context = gl;
      for (const buffer of buffers) release(() => context.deleteBuffer(buffer));
      if (program !== null) release(() => context.deleteProgram(program));
      for (const shader of shaders) release(() => context.deleteShader(shader));
      // Deleting GL objects alone can leave a large drawing buffer allocated.
      release(() => context.getExtension("WEBGL_lose_context")?.loseContext());
    }
    if (glCanvas !== null) glCanvas.width = glCanvas.height = 0;
  };

  let positionLocation: number;
  let sizeLocation: number;
  let alphaLocation: number;
  let colorLocation: number;
  let resolutionLocation: WebGLUniformLocation;
  let scaleLocation: WebGLUniformLocation;
  let alphaLocationU: WebGLUniformLocation;
  try {
    display = canvas.getContext("2d");
    if (display === null) return noopHandle();
    glCanvas = doc.createElement("canvas");
    gl = glCanvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "default",
    });
    if (gl === null) { releaseGPU(); return noopHandle(); }
    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type);
      if (shader === null) throw new Error("Cannot allocate particle shader");
      shaders.push(shader);
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("Cannot compile particle shader");
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
    if ([positionLocation, sizeLocation, alphaLocation, colorLocation].some((value) => value < 0)
      || resolution === null || scale === null || alpha === null) throw new Error("Incomplete particle program");
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
  const particles: Particle[] = [];
  const query = typeof view.matchMedia === "function" ? view.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let reduced = query?.matches ?? false;
  let requested = false;
  let disposed = false;
  let raf: number | null = null;
  let observer: ResizeObserver | null = null;
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

  const reset = (particle: Particle, randomLife: boolean) => {
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
  const simulate = (dt: number) => {
    active = Math.round(240 + (smoothLevel / 30) * (MAX_PARTICLES - 240));
    const levelFactor = 0.45 + 0.55 * (smoothLevel / 30);
    const radius = Math.min(width, height) * 0.34;
    const repelling = pointerDown || Math.hypot(pointerVX, pointerVY) > 1.4;
    for (let index = 0; index < active; index += 1) {
      const particle = particles[index];
      particle.life += dt;
      if (particle.life > particle.maxLife) reset(particle, false);
      const curl = Math.sin(particle.y * 0.0016 + time * 0.25 + particle.phase);
      particle.vx += curl * width * 0.02 * dt + (Math.random() - 0.5) * width * 0.05 * dt;
      particle.vy -= height * 0.008 * dt;
      particle.vy += (Math.random() - 0.5) * height * 0.03 * dt;
      const dx = pointerX - particle.x;
      const dy = pointerY - particle.y;
      const distance = Math.hypot(dx, dy);
      if (pointerX > -1e3 && distance < radius && distance > 0.001) {
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
      particle.vx += (toFaceX / faceDistance) * pull;
      particle.vy += (toFaceY / faceDistance) * pull;
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
    // A quick pointer movement should scatter briefly, rather than permanently.
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
      [colors.subarray(0, active * 3), colorLocation, 3],
    ] as const;
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
  const tick = (now: number) => {
    raf = null;
    if (!canDraw() || reduced) return;
    const dt = (last === 0 ? 16 : Math.min(48, Math.max(0, now - last))) / 1000;
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
    try { resize(); } catch { dispose(); return; }
    if (!canDraw() || reduced) cancelFrame();
    if (!canDraw()) return;
    if (reduced) {
      smoothLevel = level;
      smoothDark = dark ? 1 : 0;
      try {
        simulate(0);
        render();
      } catch { dispose(); }
    } else if (raf === null) raf = view.requestAnimationFrame(tick);
  };
  const onResize = () => syncActivity();
  const onVisibility = () => syncActivity();
  const onMotionChange = (event: MediaQueryListEvent) => { reduced = event.matches; syncActivity(); };
  const onPointerLeave = () => {
    pointerX = pointerY = -1e4;
    pointerVX = pointerVY = 0;
    pointerDown = false;
    lastPointer = 0;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!canDraw() || reduced) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { onPointerLeave(); return; }
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
  const onPointerDown = () => { if (canDraw() && !reduced) pointerDown = true; };
  const onPointerUp = () => { pointerDown = false; };
  const onContextLost = (event: Event) => { event.preventDefault(); dispose(); };
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
  const relativePoint = (x: number, y: number) => {
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
      if (point !== null) { anchorX = point.x; anchorY = point.y; }
    },
    setTarget(x, y) {
      if (disposed) return;
      const point = relativePoint(x, y);
      if (point !== null) { targetX = point.x; targetY = point.y; }
    },
    start() {
      if (requested || disposed) return;
      requested = true;
      reduced = query?.matches ?? false;
      try { resize(); } catch { dispose(); return; }
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
    dispose,
  };
}
