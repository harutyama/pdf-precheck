import type { ProgressState } from "../pdf/types.ts";

type ProgressPanelProps = {
  progress: ProgressState;
};

export function ProgressPanel({ progress }: ProgressPanelProps) {
  const ratio = (() => {
    if (progress.totalFiles && progress.currentFile) {
      const finished = (progress.currentFile - 1) / progress.totalFiles;
      const withinFile =
        progress.currentPage && progress.totalPages
          ? progress.currentPage / progress.totalPages
          : progress.phase === "evaluating"
            ? 0.9
            : 0.35;
      return Math.round((finished + withinFile / progress.totalFiles) * 100);
    }
    if (progress.currentPage && progress.totalPages) {
      return Math.round((progress.currentPage / progress.totalPages) * 100);
    }
    if (progress.phase === "evaluating") return 92;
    if (progress.phase === "opening") return 24;
    return 8;
  })();

  return (
    <section className="progress-panel" aria-live="polite">
      <p>{progress.message}</p>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(4, ratio))}%` }} />
      </div>
    </section>
  );
}
