import type { ProgressState } from "../pdf/types.ts";

type ProgressPanelProps = {
  progress: ProgressState;
};

export function ProgressPanel({ progress }: ProgressPanelProps) {
  const ratio =
    progress.currentPage && progress.totalPages
      ? Math.round((progress.currentPage / progress.totalPages) * 100)
      : progress.phase === "evaluating"
        ? 92
        : progress.phase === "opening"
          ? 24
          : 8;

  return (
    <section className="progress-panel" aria-live="polite">
      <p>{progress.message}</p>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${ratio}%` }} />
      </div>
    </section>
  );
}
