import { pageCountBucket } from "../pdf/checks/pages.ts";
import { sizeBucket } from "../pdf/checks/fileSize.ts";
import type { CheckReport } from "../pdf/types.ts";

export const AnalyticsEvent = {
  pdfSelected: "pdf_selected",
  checkStarted: "check_started",
  checkSucceeded: "check_succeeded",
  checkFailed: "check_failed",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export type AnalyticsParams = Record<string, string | number | boolean>;

const FORBIDDEN_KEYS = new Set([
  "filename",
  "file_name",
  "name",
  "title",
  "page_title",
  "pdf",
  "content",
  "text",
  "document",
]);

export function sanitizeAnalyticsParams(
  params: AnalyticsParams | undefined,
): AnalyticsParams | undefined {
  if (!params) return undefined;

  const clean: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) continue;
    if (typeof value === "string" && value.length > 40) continue;
    clean[key] = value;
  }
  return clean;
}

export function selectedParams(size: number): AnalyticsParams {
  return { size_bucket: sizeBucket(size) };
}

export function startedParams(size: number): AnalyticsParams {
  return { size_bucket: sizeBucket(size) };
}

export function completedParams(report: CheckReport): {
  name: AnalyticsEventName;
  params: AnalyticsParams;
} {
  if (report.parseFailure) {
    return {
      name: AnalyticsEvent.checkFailed,
      params: {
        reason: report.parseFailure,
        size_bucket: sizeBucket(report.file.size),
      },
    };
  }

  return {
    name: AnalyticsEvent.checkSucceeded,
    params: {
      size_bucket: sizeBucket(report.file.size),
      page_count_bucket: pageCountBucket(report.snapshot?.pageCount ?? 0),
      result: report.overall,
    },
  };
}
