import { describe, expect, it } from "vitest";
import { checkFilename } from "./filename.ts";

function names(fileName: string) {
  return checkFilename({ name: fileName, size: 1000, mimeType: "application/pdf" });
}

function ids(fileName: string) {
  return names(fileName).map((item) => item.id);
}

describe("checkFilename", () => {
  it("accepts a normal Japanese name", () => {
    const results = names("提出用_報告書.pdf");
    expect(results.some((item) => item.severity !== "ok")).toBe(false);
    expect(ids("提出用_報告書.pdf")).toContain("filename-value");
  });

  it("flags a missing extension", () => {
    expect(names("report").some((item) => item.id === "filename-extension" && item.severity === "warning")).toBe(true);
  });

  it("flags draft-like names", () => {
    expect(ids("報告書のコピー.pdf")).toContain("filename-draft");
    expect(ids("report (1).pdf")).toContain("filename-draft");
  });

  it("flags unsafe characters", () => {
    expect(ids("report?.pdf")).toContain("filename-unsafe");
  });

  it("flags empty names", () => {
    const results = names("   ");
    expect(results[0]?.severity).toBe("error");
  });

  it("flags reserved Windows names", () => {
    expect(ids("CON.pdf")).toContain("filename-reserved");
  });

  it("flags invisible characters", () => {
    expect(ids("report\u200b.pdf")).toContain("filename-invisible");
  });
});
