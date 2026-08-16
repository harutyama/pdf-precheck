import { useEffect, useState } from "react";
import {
  AnalyticsEvent,
  completedParams,
  selectedParams,
  startedParams,
} from "../analytics/events.ts";
import { trackEvent } from "../analytics/ga.ts";
import { privacyNotice, site } from "../config/site.ts";
import { runChecks } from "../pdf/runChecks.ts";
import type { CheckReport, ProgressState } from "../pdf/types.ts";
import { DropZone } from "../ui/DropZone.tsx";
import { ProgressPanel } from "../ui/ProgressPanel.tsx";
import { BatchResultView } from "../ui/ResultView.tsx";

export function HomePage() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [reports, setReports] = useState<CheckReport[] | null>(null);
  const [ignoredCount, setIgnoredCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const prevent = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  async function handleFiles(files: File[], ignored: number): Promise<void> {
    setErrorMessage(null);
    setReports(null);
    setIgnoredCount(ignored);

    const nextReports: CheckReport[] = [];
    try {
      for (const [index, file] of files.entries()) {
        trackEvent(AnalyticsEvent.pdfSelected, selectedParams(file.size));
        trackEvent(AnalyticsEvent.checkStarted, startedParams(file.size));
        const position = `${index + 1} / ${files.length}`;
        setProgress({
          phase: "reading",
          message:
            files.length === 1
              ? "ファイルを読み込んでいます…"
              : `${position} 件目を読み込んでいます…`,
          currentFile: index + 1,
          totalFiles: files.length,
        });

        try {
          const report = await runChecks(file, (inner) => {
            setProgress({
              ...inner,
              currentFile: index + 1,
              totalFiles: files.length,
              message:
                files.length === 1
                  ? inner.message
                  : `${position} 件目：${inner.message}`,
            });
          });
          const completed = completedParams(report);
          trackEvent(completed.name, completed.params);
          nextReports.push(report);
        } catch {
          trackEvent(AnalyticsEvent.checkFailed, { reason: "unknown" });
          setErrorMessage("チェック中に予期しない問題が起きました。別のファイルで試してください。");
          return;
        }
      }

      trackEvent(AnalyticsEvent.batchCompleted, {
        file_count: files.length,
        ok_count: nextReports.filter((item) => item.overall === "ok").length,
        warning_count: nextReports.filter((item) => item.overall === "warning").length,
        error_count: nextReports.filter((item) => item.overall === "error").length,
      });
      setReports(nextReports);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">提出・納品の直前に</p>
        <h1>{site.name}</h1>
        <p className="lead">{site.tagline}</p>
        <p className="privacy-callout">{privacyNotice()}</p>
      </section>

      <DropZone disabled={progress !== null} onFiles={handleFiles} />

      {progress ? <ProgressPanel progress={progress} /> : null}
      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
      {reports ? (
        <BatchResultView
          reports={reports}
          ignoredCount={ignoredCount}
          onReset={() => {
            setReports(null);
            setIgnoredCount(0);
            setErrorMessage(null);
          }}
        />
      ) : (
        <section className="how">
          <h2>何を確認しますか</h2>
          <ul>
            <li>PDFとして開けるか</li>
            <li>ページ数とファイルサイズ</li>
            <li>A4などの用紙サイズ</li>
            <li>縦向き・横向きの混在</li>
            <li>提出時に困りやすいファイル名</li>
            <li>パスワード保護されているか</li>
            <li>最大{site.maxPdfFiles}ファイルまで、一度にチェックできます</li>
          </ul>
        </section>
      )}
    </div>
  );
}
