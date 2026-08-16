import { evaluateSnapshot, overallStatusOf, parseFailureResult } from "./evaluate.ts";
import { checkFileSize } from "./checks/fileSize.ts";
import { checkFilename } from "./checks/filename.ts";
import type { CheckReport, FileMeta, ProgressHandler } from "./types.ts";

export { evaluateSnapshot, overallStatusOf } from "./evaluate.ts";

export async function runChecks(
  file: File,
  onProgress?: ProgressHandler,
): Promise<CheckReport> {
  const meta: FileMeta = {
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };

  onProgress?.({
    phase: "reading",
    message: "ファイルを読み込んでいます…",
  });

  const data = await file.arrayBuffer();
  const { parsePdf } = await import("./parsePdf.ts");
  const parsed = await parsePdf(data, onProgress);

  onProgress?.({
    phase: "evaluating",
    message: "チェック結果をまとめています…",
  });

  if (!parsed.ok) {
    const results = [
      ...checkFilename(meta),
      ...checkFileSize(meta),
      parseFailureResult(parsed.reason, parsed.message),
    ];
    return {
      overall: overallStatusOf(results),
      results,
      file: meta,
      snapshot: null,
      parseFailure: parsed.reason,
    };
  }

  const results = evaluateSnapshot(meta, parsed.snapshot);
  return {
    overall: overallStatusOf(results),
    results,
    file: meta,
    snapshot: parsed.snapshot,
    parseFailure: null,
  };
}
