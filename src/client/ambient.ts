export interface AmbientHandle {
  setLevel(level: number, dark: boolean): void;
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
  vec2 d = gl_PointCoord - vec2(0.5);
  float r = length(d) * 2.0;
  if (r > 1.0) discard;
  float core = pow(max(0.0, 1.0 - r), 2.6);
  float halo = pow(max(0.0, 1.0 - r), 1.1) * 0.35;
  float a = (core + halo) * v_alpha;
  gl_FragColor = vec4(v_color, a);
}
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
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

/**
 * WebGL particle river for the skin backdrop.
 *
 * Thousands of tiny additive points flow along the right edge (bottom-right
 * corner to mid-right), drift slowly, and steer around the pointer: a gentle
 * pull and swirl by default, a scatter while the pointer is pressed or moving
 * fast. Count, size, warmth and speed follow the cultivation level.
 */
export function createAmbient(canvas: HTMLCanvasElement): AmbientHandle {
  const display = canvas.getContext("2d");
  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });

  if (gl === null || display === null) {
    return { setLevel() {}, setAnchor() {}, setTarget() {}, start() {}, stop() {}, dispose() {} };
  }

  const reduceMotion = typeof matchMedia === "function"
    && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (vertex === null || fragment === null || program === null) {
    return { setLevel() {}, start() {}, stop() {}, dispose() {} };
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return { setLevel() {}, start() {}, stop() {}, dispose() {} };
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
  if (buffer === null || positionLocation < 0 || sizeLocation < 0
    || alphaLocation < 0 || colorLocation < 0 || resolutionLocation === null) {
    return { setLevel() {}, start() {}, stop() {}, dispose() {} };
  }

  const particles: Particle[] = [];
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

  const gold: [number, number, number] = [0.86, 0.68, 0.36];
  const cool: [number, number, number] = [0.74, 0.8, 0.92];

  const reset = (particle: Particle, randomLife: boolean) => {
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

  const riverPoint = (t: number, offset: number) => {
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
      y: a * y0 + b * y1 + c * y2 + d * y3 + spread * 0.35,
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

  const onPointerMove = (event: PointerEvent) => {
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
  const onPointerDown = () => { pointerDown = true; };
  const onPointerUp = () => { pointerDown = false; };
  const onPointerLeave = () => {
    pointerX = -1e4;
    pointerY = -1e4;
    pointerDown = false;
  };

  const simulate = (dt: number) => {
    const targetCount = Math.round(240 + (smoothLevel / 30) * (MAX_PARTICLES - 240));
    active = Math.min(MAX_PARTICLES, targetCount);
    const repelling = pointerDown || Math.hypot(pointerVX, pointerVY) > 1.4;
    const radius = Math.min(width, height) * 0.34;
    const levelFactor = 0.45 + 0.55 * (smoothLevel / 30);
    const loop = (particle: Particle, index: number) => {
      particle.life += dt;
      if (particle.life > particle.maxLife) reset(particle, false);

      // No channel: a slow buoyant spill from the composer with curling drift,
      // so the plume widens probabilistically instead of hugging a path.
      const curl = Math.sin(particle.y * 0.0016 + time * 0.25 + particle.phase);
      particle.vx += curl * width * 0.02 * dt;
      particle.vy -= height * 0.008 * dt;
      particle.vx += (Math.random() - 0.5) * width * 0.05 * dt;
      particle.vy += (Math.random() - 0.5) * height * 0.03 * dt;

      if (pointerX > -1e3) {
        const dx = pointerX - particle.x;
        const dy = pointerY - particle.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius && distance > 0.001) {
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

      // Drift toward the face: a soft wind rather than a swirl.
      const faceX = targetX * width;
      const faceY = targetY * height;
      const toFaceX = faceX - particle.x;
      const toFaceY = faceY - particle.y;
      const faceDistance = Math.hypot(toFaceX, toFaceY) || 1;
      const pull = 26 * dt * levelFactor;
      particle.vx += (toFaceX / faceDistance) * pull;
      particle.vy += (toFaceY / faceDistance) * pull;

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
      // The last tier (24-30) gets an extra bloom so the emperor stage outshines
      // the mid tiers instead of merely being denser.
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
    return { setLevel() {}, start() {}, stop() {}, dispose() {} };
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
    // Blit the GPU frame into the visible 2D canvas: WebGL layers are not
    // always composited the same way across shells, a 2D surface always is.
    display.clearRect(0, 0, canvas.width, canvas.height);
    display.drawImage(glCanvas, 0, 0, canvas.width, canvas.height);
  };

  const tick = (now: number) => {
    if (!running || disposed) return;
    frameHandle = requestAnimationFrame(tick);
    if (document.hidden) {
      last = now;
      return;
    }
    const delta = last === 0 ? 16 : Math.min(48, now - last);
    last = now;
    const dt = delta / 1000;
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
          const particle: Particle = {
            x: 0, y: 0, vx: 0, vy: 0, t: 0, speed: 0.03,
            offset: 0, size: 3, phase: 0,
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
    },
  };
}
