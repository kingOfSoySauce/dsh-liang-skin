import { describe, expect, it } from "vitest";
import { createEffortSync } from "./effort-sync";
import { frameForLevel, levelForFrame, snapFrame } from "./logic";

const selection = (key: string, frame: number, mode = "model-a:fine") => ({ key, frame, mode, fine: true });

describe("optional fine slider", () => {
  it("exposes 31 distinct stops including both endpoints", () => {
    const stops = Array.from({ length: 31 }, (_, level) => frameForLevel(level));
    expect(new Set(stops).size).toBe(31);
    expect(stops[0]).toBe(0);
    expect(stops[30]).toBe(240);
    expect(snapFrame(137)).toBe(136);
    expect(levelForFrame(136)).toBe(17);
  });

  it("consumes an acknowledgement so Off -> High through the native picker still follows", () => {
    const sync = createEffortSync();
    sync.observe(selection("off", 0));
    sync.submit("high", "off", "model-a:fine");
    expect(sync.observe(selection("off", 0))).toBeNull();
    expect(sync.observe(selection("high", 120))).toBeNull();
    expect(sync.observe(selection("off", 0))).toBe(0);
    expect(sync.observe(selection("high", 120))).toBe(120);
  });

  it("resynchronizes for a different model or effort layout even at the same index", () => {
    const sync = createEffortSync();
    sync.observe(selection("a:high", 120));
    sync.submit("a:max", "a:high", "model-a:fine");
    expect(sync.observe(selection("b:high", 64, "model-b:fine"))).toBe(64);
    expect(sync.observe({ key: "b:high", frame: 60, mode: "model-b:normal", fine: false })).toBe(60);
  });

  it("follows an external selection during submission and recovers after rejection", () => {
    const sync = createEffortSync();
    sync.observe(selection("off", 0));
    sync.submit("high", "off", "model-a:fine");
    expect(sync.observe(selection("max", 240))).toBe(240);
    expect(sync.observe(selection("high", 120))).toBe(120);
    sync.submit("off", "high", "model-a:fine");
    sync.reset();
    expect(sync.observe(selection("high", 120))).toBeNull();
    expect(sync.observe(selection("off", 0))).toBe(0);
  });
});
