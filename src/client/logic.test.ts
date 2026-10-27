import { describe, expect, it } from "vitest";
import {
  frameForEffort,
  indicatorLabel,
  liangRankForFrame,
  nearestEffortIndex,
  paletteForFrame,
  portraitBlendForLevel,
  selectedEffortIndex,
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
    expect(paletteForFrame(0).accent).toBe("rgb(65, 118, 230)");
    expect(paletteForFrame(240).accent).toBe("rgb(193, 154, 73)");
    expect(paletteForFrame(0)).toMatchObject({
      maskBase: "rgba(232, 233, 229, 0.28)",
      maskStrong: "rgba(232, 233, 229, 0.46)",
      maskSoft: "rgba(232, 233, 229, 0.2)",
      controlRail: "rgba(112, 116, 111, 0.28)",
      controlBorder: "rgba(112, 116, 111, 0.72)",
      controlFill: "rgb(218, 219, 216)",
      layer1: "rgba(248, 248, 245, 0.58)",
      layer2: "rgba(238, 239, 235, 0.6)",
      layer3: "rgba(238, 239, 235, 0.7)",
      sidebar: "rgba(234, 235, 231, 0.66)",
      portraitOpacity: "1",
    });
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
});
