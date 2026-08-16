import { checkFilename } from "./checks/filename.ts";
import { checkFileSize } from "./checks/fileSize.ts";
import { checkOrientation, checkPageCount, checkPageSizes } from "./checks/pages.ts";
import type { CheckReport, CheckResult, FileMeta, OverallStatus } from "./types.ts";

export function overallStatusOf(results: CheckResult[]): OverallStatus {
  if (results.some((item) => item.severity === "error")) return "error";
  if (results.some((item) => item.severity === "warning")) return "warning";
  return "ok";
}

export function parseFailureResult(
  reason: CheckReport["parseFailure"],
  message: string,
): CheckResult {
  const title =
    reason === "encrypted"
      ? "パスワード保護"
      : reason === "not_pdf"
        ? "ファイル形式"
        : "PDFの読み込み";

  const action =
    reason === "encrypted"
      ? "パスワードを外した提出用PDFを用意してください。提出先が開けないことがあります。"
      : reason === "not_pdf"
        ? "PDFファイルを選び直してください。Wordや画像のまま送っていないか確認してください。"
        : "ファイルが壊れている可能性があります。元の書類から書き出し直してください。";

  return {
    id: "readable",
    title,
    severity: "error",
    summary: message,
    action,
  };
}

export function evaluateSnapshot(file: FileMeta, snapshot: CheckReport["snapshot"]): CheckResult[] {
  const results: CheckResult[] = [...checkFilename(file), ...checkFileSize(file)];

  if (!snapshot) {
    return results;
  }

  results.push({
    id: "readable",
    title: "PDFの読み込み",
    severity: "ok",
    summary: "PDFとして正常に読み込めました。",
  });
  results.push(checkPageCount(snapshot));
  results.push(...checkPageSizes(snapshot));
  results.push(...checkOrientation(snapshot));
  return results;
}
