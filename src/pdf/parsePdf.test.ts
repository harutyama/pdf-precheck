/** @vitest-environment jsdom */

import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { parsePdf } from "./parsePdf.ts";
import { runChecks } from "./runChecks.ts";

async function makePdf(
  pages: Array<{ width: number; height: number }>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const page of pages) {
    doc.addPage([page.width, page.height]);
  }
  return doc.save();
}

function asFile(name: string, bytes: Uint8Array, type = "application/pdf"): File {
  const copy = new Uint8Array(bytes);
  return new File([copy], name, { type });
}

describe("parsePdf", () => {
  it("reads a single A4 page", async () => {
    const bytes = await makePdf([{ width: 595.28, height: 841.89 }]);
    const result = await parsePdf(bytes);
    if (!result.ok) {
      throw new Error(`parse failed: ${result.reason} ${result.message}`);
    }
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.pageCount).toBe(1);
      expect(result.snapshot.pages[0]?.paperName).toBe("A4");
      expect(result.snapshot.pages[0]?.orientation).toBe("portrait");
    }
  });

  it("reads mixed orientation and mixed sizes", async () => {
    const bytes = await makePdf([
      { width: 595.28, height: 841.89 },
      { width: 841.89, height: 595.28 },
      { width: 612, height: 792 },
    ]);
    const result = await parsePdf(bytes);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.pageCount).toBe(3);
      expect(result.snapshot.pages[1]?.orientation).toBe("landscape");
      expect(result.snapshot.pages[2]?.paperName).toBe("レター");
    }
  });

  it("rejects empty data", async () => {
    const result = await parsePdf(new ArrayBuffer(0));
    expect(result).toMatchObject({ ok: false, reason: "empty" });
  });

  it("rejects a non-PDF file", async () => {
    const result = await parsePdf(new TextEncoder().encode("hello world"));
    expect(result).toMatchObject({ ok: false, reason: "not_pdf" });
  });

  it("classifies a password exception as encrypted", async () => {
    const { classifyLoadError } = await import("./parsePdf.ts");
    const reason = classifyLoadError(
      { name: "PasswordException", code: 1 },
      new TextEncoder().encode("%PDF-1.4"),
    );
    expect(reason).toBe("encrypted");
  });

  it("rejects a broken PDF header", async () => {
    const result = await parsePdf(new TextEncoder().encode("%PDF-1.4 broken"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["corrupt", "not_pdf", "unknown"]).toContain(result.reason);
    }
  });
});

describe("runChecks", () => {
  it("returns a warning for mixed orientation", async () => {
    const bytes = await makePdf([
      { width: 595.28, height: 841.89 },
      { width: 595.28, height: 841.89 },
      { width: 841.89, height: 595.28 },
    ]);
    const report = await runChecks(asFile("提出用.pdf", bytes));
    expect(report.parseFailure).toBeNull();
    expect(report.overall).toBe("warning");
    expect(report.results.some((item) => item.id === "orientation" && item.severity === "warning")).toBe(true);
  });

  it("returns a warning for mixed page sizes", async () => {
    const bytes = await makePdf([
      { width: 595.28, height: 841.89 },
      { width: 612, height: 792 },
    ]);
    const report = await runChecks(asFile("提出用.pdf", bytes));
    expect(report.overall).toBe("warning");
    expect(report.results.some((item) => item.id === "page-size" && item.severity === "warning")).toBe(true);
  });

  it("handles a longer multi-page PDF", async () => {
    const pages = Array.from({ length: 12 }, () => ({ width: 595.28, height: 841.89 }));
    const bytes = await makePdf(pages);
    const report = await runChecks(asFile("提出用_12p.pdf", bytes));
    expect(report.overall).toBe("ok");
    expect(report.snapshot?.pageCount).toBe(12);
  });

  it("returns an error for a text file", async () => {
    const report = await runChecks(asFile("notes.txt", new TextEncoder().encode("not a pdf"), "text/plain"));
    expect(report.overall).toBe("error");
    expect(report.parseFailure).toBe("not_pdf");
  });
});
