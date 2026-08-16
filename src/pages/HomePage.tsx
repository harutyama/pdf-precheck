import { useEffect, useState } from "react";
import {
  AnalyticsEvent,
  completedParams,
  selectedParams,
  startedParams,
} from "../analytics/events.ts";
import { trackEvent } from "../analytics/ga.ts";
import { site } from "../config/site.ts";
import { runChecks } from "../pdf/runChecks.ts";
import type { CheckReport, ProgressState } from "../pdf/types.ts";
import { DropZone } from "../ui/DropZone.tsx";
import { ProgressPanel } from "../ui/ProgressPanel.tsx";
import { ResultView } from "../ui/ResultView.tsx";

export function HomePage() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [report, setReport] = useState<CheckReport | null>(null);
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

  async function handleFile(file: File): Promise<void> {
    setErrorMessage(null);
    setReport(null);
    trackEvent(AnalyticsEvent.pdfSelected, selectedParams(file.size));
    trackEvent(AnalyticsEvent.checkStarted, startedParams(file.size));
    setProgress({ phase: "reading", message: "ファイルを読み込んでいます…" });

    try {
      const next = await runChecks(file, setProgress);
      const completed = completedParams(next);
      trackEvent(completed.name, completed.params);
      setReport(next);
    } catch {
      trackEvent(AnalyticsEvent.checkFailed, { reason: "unknown" });
      setErrorMessage("チェック中に予期しない問題が起きました。別のファイルで試してください。");
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
        <p className="privacy-callout">{site.privacyLine}</p>
      </section>

      <DropZone disabled={progress !== null} onFile={handleFile} />

      {progress ? <ProgressPanel progress={progress} /> : null}
      {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
      {report ? (
        <ResultView
          report={report}
          onReset={() => {
            setReport(null);
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
          </ul>
        </section>
      )}
    </div>
  );
}
