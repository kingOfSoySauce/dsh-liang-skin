export interface PortraitMotionHandle {
  setRunning(running: boolean): void;
  setPreviewing(previewing: boolean): void;
  dispose(): void;
}

type MotionState = "idle" | "running" | "preview";

const PRESETS = {
  idle: { opacity: "0.32", scale: "0.9" },
  running: { opacity: "0.69", scale: "1" },
  preview: { opacity: "1", scale: "1" },
} as const;

/** Opt-in state styling, scoped entirely to this backdrop. No timers or images. */
export function createPortraitMotion(root: HTMLElement): PortraitMotionHandle {
  const attributes = ["data-motion", "data-motion-state"] as const;
  const properties = ["--liang-motion-opacity", "--liang-motion-scale"] as const;
  const previousAttributes = attributes.map((name) => [name, root.getAttribute(name)] as const);
  const previousProperties = properties.map((name) => ({
    name,
    value: root.style.getPropertyValue(name),
    priority: root.style.getPropertyPriority(name),
  }));
  let running = false;
  let previewing = false;
  let disposed = false;

  const sync = () => {
    if (disposed) return;
    const state: MotionState = previewing ? "preview" : running ? "running" : "idle";
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
    },
  };
}
