import {
  getDocument,
  GlobalWorkerOptions,
  InvalidPDFException,
  PasswordException,
  PasswordResponses,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import {
  identifyPaper,
  orientationOf,
  pointsToMm,
  roundMm,
} from "./pageSizes.ts";
import type { PageInfo, ParseFailureReason, ParseOutcome, ProgressHandler } from "./types.ts";

let workerConfigured = false;

function ensureWorker(): void {
  if (workerConfigured) return;
  const alreadyResolved = GlobalWorkerOptions.workerSrc?.startsWith("file:");
  if (!alreadyResolved) {
    GlobalWorkerOptions.workerSrc = workerUrl;
  }
  workerConfigured = true;
}

export function looksLikePdf(bytes: Uint8Array): boolean {
  const head = bytes.subarray(0, 1024);
  const text = new TextDecoder("latin1").decode(head);
  return text.includes("%PDF");
}

export function classifyLoadError(error: unknown, bytes: Uint8Array): ParseFailureReason {
  if (error instanceof PasswordException || isPasswordError(error)) {
    return "encrypted";
  }
  if (error instanceof InvalidPDFException || !looksLikePdf(bytes)) {
    return looksLikePdf(bytes) ? "corrupt" : "not_pdf";
  }
  return "unknown";
}

export async function parsePdf(
  data: ArrayBuffer | Uint8Array,
  onProgress?: ProgressHandler,
): Promise<ParseOutcome> {
  ensureWorker();

  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.byteLength === 0) {
    return {
      ok: false,
      reason: "empty",
      message: "ファイルが空です。",
    };
  }
  onProgress?.({
    phase: "opening",
    message: "PDFを読み込んでいます…",
  });

  try {
    const bytesForWorker = bytes.slice();
    const task = getDocument({
      data: bytesForWorker,
      disableAutoFetch: true,
      disableStream: true,
      useSystemFonts: true,
      verbosity: 0,
    });
    const pdf = await task.promise;
    const pageCount = pdf.numPages;

    if (pageCount <= 0) {
      await pdf.cleanup();
      await task.destroy();
      return {
        ok: false,
        reason: "corrupt",
        message: "ページが 0 件のPDFです。",
      };
    }

    const pages: PageInfo[] = [];
    for (let index = 1; index <= pageCount; index += 1) {
      onProgress?.({
        phase: "pages",
        message: `ページを確認しています（${index} / ${pageCount}）`,
        currentPage: index,
        totalPages: pageCount,
      });

      const page = await pdf.getPage(index);
      const viewport = page.getViewport({ scale: 1 });
      const widthPt = viewport.width;
      const heightPt = viewport.height;
      pages.push({
        index,
        widthPt,
        heightPt,
        widthMm: roundMm(pointsToMm(widthPt)),
        heightMm: roundMm(pointsToMm(heightPt)),
        orientation: orientationOf(widthPt, heightPt),
        paperName: identifyPaper(widthPt, heightPt),
      });
      page.cleanup();
    }

    await pdf.cleanup();
    await task.destroy();

    return {
      ok: true,
      snapshot: { pageCount, pages },
    };
  } catch (error) {
    const reason = classifyLoadError(error, bytes);
    const message =
      reason === "encrypted"
        ? "パスワードで保護されたPDFです。"
        : reason === "not_pdf"
          ? "PDFファイルとして認識できませんでした。"
          : "PDFを正常に読み込めませんでした。";
    return { ok: false, reason, message };
  }
}

function isPasswordError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; code?: number };
  return (
    candidate.name === "PasswordException" ||
    candidate.code === PasswordResponses.NEED_PASSWORD ||
    candidate.code === PasswordResponses.INCORRECT_PASSWORD
  );
}
