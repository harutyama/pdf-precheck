import { describe, expect, it } from "vitest";
import { evaluateSnapshot, overallStatusOf } from "./evaluate.ts";
import { identifyPaper, orientationOf, pointsToMm, roundMm } from "./pageSizes.ts";
import type { CheckResult, PageInfo } from "./types.ts";

function page(index: number, widthPt: number, heightPt: number): PageInfo {
  return {
    index,
    widthPt,
    heightPt,
    widthMm: roundMm(pointsToMm(widthPt)),
    heightMm: roundMm(pointsToMm(heightPt)),
    orientation: orientationOf(widthPt, heightPt),
    paperName: identifyPaper(widthPt, heightPt),
  };
}

describe("overallStatusOf", () => {
  it("prefers error over warning", () => {
    const results: CheckResult[] = [
      { id: "a", title: "a", severity: "ok", summary: "ok" },
      { id: "b", title: "b", severity: "warning", summary: "warn" },
      { id: "c", title: "c", severity: "error", summary: "err" },
    ];
    expect(overallStatusOf(results)).toBe("error");
  });

  it("uses warning when there is no error", () => {
    const results: CheckResult[] = [
      { id: "a", title: "a", severity: "ok", summary: "ok" },
      { id: "b", title: "b", severity: "warning", summary: "warn" },
    ];
    expect(overallStatusOf(results)).toBe("warning");
  });
});

describe("evaluateSnapshot", () => {
  it("returns ok for a clean A4 document", () => {
    const results = evaluateSnapshot(
      { name: "提出用.pdf", size: 120_000, mimeType: "application/pdf" },
      { pageCount: 2, pages: [page(1, 595.28, 841.89), page(2, 595.28, 841.89)] },
    );
    expect(overallStatusOf(results)).toBe("ok");
    expect(results.some((item) => item.id === "readable" && item.severity === "ok")).toBe(true);
  });
});
