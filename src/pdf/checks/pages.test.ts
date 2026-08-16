import { describe, expect, it } from "vitest";
import { identifyPaper, orientationOf, pointsToMm, roundMm } from "../pageSizes.ts";
import type { PageInfo, PdfSnapshot } from "../types.ts";
import { checkOrientation, checkPageCount, checkPageSizes } from "./pages.ts";

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

function snapshot(pages: PageInfo[]): PdfSnapshot {
  return { pageCount: pages.length, pages };
}

describe("checkPageCount", () => {
  it("reports a normal page count as ok", () => {
    const result = checkPageCount(snapshot([page(1, 595.28, 841.89)]));
    expect(result.severity).toBe("ok");
    expect(result.summary).toContain("全1ページ");
  });

  it("errors on zero pages", () => {
    expect(checkPageCount({ pageCount: 0, pages: [] }).severity).toBe("error");
  });
});

describe("checkPageSizes", () => {
  it("accepts consistent A4 pages", () => {
    const result = checkPageSizes(
      snapshot([page(1, 595.28, 841.89), page(2, 595.28, 841.89)]),
    )[0];
    expect(result.severity).toBe("ok");
    expect(result.summary).toContain("A4");
  });

  it("warns when sizes are mixed", () => {
    const result = checkPageSizes(
      snapshot([page(1, 595.28, 841.89), page(2, 612, 792)]),
    )[0];
    expect(result.severity).toBe("warning");
    expect(result.summary).toContain("混在");
    expect(result.detail).toContain("2ページ目");
  });

  it("warns on a consistent non-standard size", () => {
    const result = checkPageSizes(snapshot([page(1, 400, 400)]))[0];
    expect(result.severity).toBe("warning");
    expect(result.summary).toContain("一般的な用紙サイズではありません");
  });
});

describe("checkOrientation", () => {
  it("accepts consistent portrait pages", () => {
    const result = checkOrientation(
      snapshot([page(1, 595.28, 841.89), page(2, 595.28, 841.89)]),
    )[0];
    expect(result.severity).toBe("ok");
  });

  it("warns when one page is landscape", () => {
    const result = checkOrientation(
      snapshot([
        page(1, 595.28, 841.89),
        page(2, 595.28, 841.89),
        page(3, 841.89, 595.28),
      ]),
    )[0];
    expect(result.severity).toBe("warning");
    expect(result.summary).toContain("3ページ目");
    expect(result.summary).toContain("横向き");
    expect(result.action).toBeTruthy();
  });
});
