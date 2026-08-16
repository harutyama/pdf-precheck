import { describe, expect, it } from "vitest";
import { AnalyticsEvent, completedParams, sanitizeAnalyticsParams } from "./events.ts";
import type { CheckReport } from "../pdf/types.ts";

describe("sanitizeAnalyticsParams", () => {
  it("drops filename-like keys and long strings", () => {
    const clean = sanitizeAnalyticsParams({
      filename: "secret.pdf",
      file_name: "secret.pdf",
      size_bucket: "lt_1mb",
      note: "x".repeat(80),
    });
    expect(clean).toEqual({ size_bucket: "lt_1mb" });
  });
});

describe("completedParams", () => {
  it("does not include the file name on success or failure", () => {
    const success: CheckReport = {
      overall: "ok",
      results: [],
      file: { name: "個人情報.pdf", size: 2048, mimeType: "application/pdf" },
      snapshot: { pageCount: 3, pages: [] },
      parseFailure: null,
    };
    const failed: CheckReport = {
      ...success,
      overall: "error",
      parseFailure: "encrypted",
    };

    expect(JSON.stringify(completedParams(success))).not.toContain("個人情報");
    expect(JSON.stringify(completedParams(failed))).not.toContain("個人情報");
    expect(completedParams(failed).params.reason).toBe("encrypted");
    expect(AnalyticsEvent.batchCompleted).toBe("batch_completed");
  });
});
