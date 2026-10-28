import { describe, expect, it } from "vitest";
import { createPortraitMotion } from "./motion";

function backdrop() {
  const attributes = new Map<string, string>();
  const values = new Map<string, { value: string; priority: string }>();
  const attribute = (key: string) => `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
  const root = {
    dataset: new Proxy({} as Record<string, string>, {
      set: (_target, key: string, value: string) => { attributes.set(attribute(key), value); return true; },
      get: (_target, key: string) => attributes.get(attribute(key)),
    }),
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
    style: {
      getPropertyValue: (name: string) => values.get(name)?.value ?? "",
      getPropertyPriority: (name: string) => values.get(name)?.priority ?? "",
      setProperty: (name: string, value: string, priority = "") => values.set(name, { value, priority }),
      removeProperty: (name: string) => values.delete(name),
    },
  };
  return { root: root as unknown as HTMLElement, attributes, values };
}

describe("optional portrait motion", () => {
  it("scopes presets to the backdrop and gives pointer preview priority over running", () => {
    const { root } = backdrop();
    const effect = createPortraitMotion(root);
    expect(root.dataset.motion).toBe("on");
    expect(root.dataset.motionState).toBe("idle");
    expect(root.style.getPropertyValue("--liang-motion-opacity")).toBe("0.32");
    effect.setRunning(true);
    expect(root.dataset.motionState).toBe("running");
    expect(root.style.getPropertyValue("--liang-motion-opacity")).toBe("0.69");
    effect.setPreviewing(true);
    effect.setRunning(false);
    expect(root.dataset.motionState).toBe("preview");
    expect(root.style.getPropertyValue("--liang-motion-opacity")).toBe("1");
    effect.setPreviewing(false);
    expect(root.dataset.motionState).toBe("idle");
    effect.dispose();
    expect(root.dataset.motion).toBeUndefined();
    expect(root.dataset.motionState).toBeUndefined();
    expect(root.style.getPropertyValue("--liang-motion-opacity")).toBe("");
    expect(root.style.getPropertyValue("--liang-motion-scale")).toBe("");
  });

  it("restores previous inline values and attributes without changing the original palette", () => {
    const { root, attributes, values } = backdrop();
    attributes.set("data-motion", "previous");
    attributes.set("data-motion-state", "previous-state");
    root.style.setProperty("--liang-motion-opacity", "0.8", "important");
    root.style.setProperty("--liang-portrait-opacity", "0.94");
    const effect = createPortraitMotion(root);
    effect.setPreviewing(true);
    effect.dispose();
    effect.dispose();
    effect.setRunning(true);
    effect.setPreviewing(true);
    expect(root.dataset.motion).toBe("previous");
    expect(root.dataset.motionState).toBe("previous-state");
    expect(root.style.getPropertyValue("--liang-motion-opacity")).toBe("0.8");
    expect(root.style.getPropertyPriority("--liang-motion-opacity")).toBe("important");
    expect(root.style.getPropertyValue("--liang-portrait-opacity")).toBe("0.94");
    expect(values.has("--liang-motion-scale")).toBe(false);
  });
});
