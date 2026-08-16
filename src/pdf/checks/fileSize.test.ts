import { describe, expect, it } from "vitest";
import { checkFileSize, FILE_SIZE_HARD_LIMIT, FILE_SIZE_SOFT_LIMIT } from "./fileSize.ts";

describe("checkFileSize", () => {
  it("errors on empty files", () => {
    const [result] = checkFileSize({ name: "a.pdf", size: 0, mimeType: "application/pdf" });
    expect(result.severity).toBe("error");
  });

  it("is ok under 10MB", () => {
    const [result] = checkFileSize({ name: "a.pdf", size: 2 * 1024 * 1024, mimeType: "application/pdf" });
    expect(result.severity).toBe("ok");
  });

  it("warns between 10MB and 25MB", () => {
    const [result] = checkFileSize({
      name: "a.pdf",
      size: FILE_SIZE_SOFT_LIMIT,
      mimeType: "application/pdf",
    });
    expect(result.severity).toBe("warning");
    expect(result.summary).toContain("大きい");
  });

  it("warns at 25MB and above", () => {
    const [result] = checkFileSize({
      name: "a.pdf",
      size: FILE_SIZE_HARD_LIMIT,
      mimeType: "application/pdf",
    });
    expect(result.severity).toBe("warning");
    expect(result.summary).toContain("大きすぎ");
  });
});
