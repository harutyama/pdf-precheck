import { describe, expect, it } from "vitest";
import { identifyPaper, orientationOf } from "./pageSizes.ts";

describe("identifyPaper", () => {
  it("recognizes A4 portrait and landscape", () => {
    expect(identifyPaper(595.28, 841.89)).toBe("A4");
    expect(identifyPaper(841.89, 595.28)).toBe("A4");
  });

  it("recognizes Letter with integer points", () => {
    expect(identifyPaper(612, 792)).toBe("レター");
  });

  it("returns null for unusual sizes", () => {
    expect(identifyPaper(200, 200)).toBeNull();
    expect(identifyPaper(1000, 400)).toBeNull();
  });

  it("allows a small rounding difference", () => {
    expect(identifyPaper(595, 842)).toBe("A4");
  });
});

describe("orientationOf", () => {
  it("classifies portrait, landscape, and square", () => {
    expect(orientationOf(595, 842)).toBe("portrait");
    expect(orientationOf(842, 595)).toBe("landscape");
    expect(orientationOf(500, 501)).toBe("square");
  });
});
