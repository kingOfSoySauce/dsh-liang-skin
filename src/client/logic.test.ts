import { describe, expect, it } from "vitest";
import {
  FINE_STEPS,
  frameForEffort,
  frameForLevel,
  indicatorLabel,
  levelForFrame,
  liangRankForFrame,
  nearestEffortIndex,
  paletteForFrame,
  portraitBlendForLevel,
  selectedEffortIndex,
  snapFrame,
} from "./logic";

const efforts = [
  { id: "off", name: "Off" },
  { id: "high", name: "High" },
  { id: "max", name: "Max" },
];

describe("滑动变祖 effort mapping", () => {
  it("spreads dynamic effort metadata across all 241 preview frames", () => {
    expect(frameForEffort(0, 3)).toBe(0);
    expect(frameForEffort(1, 3)).toBe(120);
    expect(frameForEffort(2, 3)).toBe(240);
    expect(nearestEffortIndex(119, efforts)).toBe(1);
    expect(nearestEffortIndex(181, efforts)).toBe(2);
  });

  it("recomputes anchors for two-level and five-level models", () => {
    expect([0, 1].map((index) => frameForEffort(index, 2))).toEqual([0, 240]);
    expect([0, 1, 2, 3, 4].map((index) => frameForEffort(index, 5))).toEqual([
      0, 60, 120, 180, 240,
    ]);
  });

  it("uses the provider default only when the current selection omits an effort", () => {
    expect(selectedEffortIndex(efforts, "max", "high")).toBe(2);
    expect(selectedEffortIndex(efforts, undefined, "high")).toBe(1);
    expect(selectedEffortIndex(efforts)).toBe(-1);
  });

  it("carries the original light-to-charcoal-to-gold stage mapping", () => {
    expect(paletteForFrame(0)).toMatchObject({ stage: 0, strength: 0 });
    expect(paletteForFrame(120)).toMatchObject({ stage: 0, level: 15 });
    expect(paletteForFrame(191)).toMatchObject({ stage: 0 });
    expect(paletteForFrame(192)).toMatchObject({ stage: 5 });
    expect(paletteForFrame(239)).toMatchObject({ stage: 5 });
    expect(paletteForFrame(240)).toMatchObject({ stage: 5, strength: 1 });
    expect(paletteForFrame(0).accent).toBe("rgb(65 118 230)");
    expect(paletteForFrame(240).accent).toBe("rgb(193 154 73)");
  });

  it("finds the nearest available portrait keys", () => {
    const anchors = [0, 6, 12, 15, 18, 24, 27, 30];
    expect(portraitBlendForLevel(0, anchors)).toEqual({ lowerIndex: 0, upperIndex: 0, mix: 0 });
    expect(portraitBlendForLevel(13.5, anchors)).toEqual({ lowerIndex: 2, upperIndex: 3, mix: 0.5 });
    expect(portraitBlendForLevel(31, anchors)).toEqual({ lowerIndex: 7, upperIndex: 7, mix: 0 });
  });

  it("labels continuous Liang ranks independently from model efforts", () => {
    expect(liangRankForFrame(0)).toBe("小难梁");
    expect(liangRankForFrame(48)).toBe("牢梁");
    expect(liangRankForFrame(191)).toBe("梁圣");
    expect(liangRankForFrame(192)).toBe("梁神");
    expect(liangRankForFrame(240)).toBe("梁祖");
    expect(indicatorLabel(240, efforts)).toBe("梁祖 · Max");
    expect(indicatorLabel(119, efforts)).toBe("梁子 · High");
  });

  it("snaps the thumb onto the fine grid instead of the effort anchor", () => {
    expect(FINE_STEPS).toBe(30);
    expect([0, 15, 30].map(frameForLevel)).toEqual([0, 120, 240]);
    expect(levelForFrame(240)).toBe(30);
    expect(levelForFrame(0)).toBe(0);
    // 117 is inside the High band but lands on the level-15 stop, not frame 120.
    expect(snapFrame(117)).toBe(120);
    // 57 → level 7 → frame 56: no longer collapses onto 0 or 120.
    expect(snapFrame(57)).toBe(56);
    // 161 → level 20 → frame 160.
    expect(snapFrame(161)).toBe(160);
    expect(snapFrame(-4)).toBe(0);
    expect(snapFrame(999)).toBe(240);
  });

  it("shows the fine level next to the submitted effort name", () => {
    expect(indicatorLabel(137, efforts, { withLevel: true })).toBe("梁子 17 · High");
    expect(indicatorLabel(240, efforts, { withLevel: true })).toBe("梁祖 30 · Max");
    // The submitted id still follows the nearest effort anchor: with three
    // efforts the band edges sit at 60/180, so fine stops 1–7 submit Off and
    // stops 8–22 submit High even though the skin keeps their exact level.
    expect(nearestEffortIndex(snapFrame(57), efforts)).toBe(0);
    expect(nearestEffortIndex(snapFrame(97), efforts)).toBe(1);
    expect(nearestEffortIndex(snapFrame(200), efforts)).toBe(2);
  });
});
