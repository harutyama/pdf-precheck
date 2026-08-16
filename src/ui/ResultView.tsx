import { site } from "../config/site.ts";
import { formatFileSize } from "../pdf/checks/fileSize.ts";
import type { CheckReport, CheckResult, OverallStatus } from "../pdf/types.ts";

type ResultViewProps = {
  report: CheckReport;
  heading?: string;
};

const OVERALL_COPY: Record<
  OverallStatus,
  { eyebrow: string; title: string; lead: string }
> = {
  ok: {
    eyebrow: "総合結果：問題なし",
    title: "提出前の体裁に、大きな問題は見つかりませんでした",
    lead: "ページ数・用紙サイズ・向き・ファイル名を確認しました。提出先の指定があれば、そちらも合わせて見てください。",
  },
  warning: {
    eyebrow: "総合結果：確認してください",
    title: "送る前に、下の注意点だけ見てください",
    lead: "PDFは開けています。ただし、提出先によっては直した方がよい点があります。",
  },
  error: {
    eyebrow: "総合結果：チェックできませんでした",
    title: "このファイルは、提出用として確認できませんでした",
    lead: "別のPDFを選ぶか、元の書類から書き出し直してください。",
  },
};

function groupResults(results: CheckResult[]) {
  return {
    errors: results.filter((item) => item.severity === "error"),
    warnings: results.filter((item) => item.severity === "warning"),
    oks: results.filter((item) => item.severity === "ok"),
  };
}

function ResultList({
  title,
  items,
  empty,
}: {
  title: string;
  items: CheckResult[];
  empty: string;
}) {
  return (
    <section className="result-group">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} className={`result-item is-${item.severity}`}>
              <p className="result-title">{item.title}</p>
              <p>{item.summary}</p>
              {item.detail ? <p className="muted">{item.detail}</p> : null}
              {item.action ? <p className="action">確認すること：{item.action}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ResultView({ report, heading }: ResultViewProps) {
  const copy = OVERALL_COPY[report.overall];
  const grouped = groupResults(report.results);
  const firstPage = report.snapshot?.pages[0];

  return (
    <div className="result-view">
      {heading ? <h2 className="file-heading">{heading}</h2> : null}
      <section className={`overall is-${report.overall}`}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.lead}</p>
        <dl className="counts">
          <div>
            <dt>OK</dt>
            <dd>{grouped.oks.length}</dd>
          </div>
          <div>
            <dt>注意</dt>
            <dd>{grouped.warnings.length}</dd>
          </div>
          <div>
            <dt>エラー</dt>
            <dd>{grouped.errors.length}</dd>
          </div>
        </dl>
      </section>

      <section className="info-card">
        <h3>PDFの基本情報</h3>
        <dl>
          <div>
            <dt>ファイル名</dt>
            <dd>{report.file.name || "（なし）"}</dd>
          </div>
          <div>
            <dt>サイズ</dt>
            <dd>{formatFileSize(report.file.size)}</dd>
          </div>
          <div>
            <dt>ページ数</dt>
            <dd>{report.snapshot ? `${report.snapshot.pageCount}ページ` : "取得できませんでした"}</dd>
          </div>
          <div>
            <dt>用紙</dt>
            <dd>
              {firstPage
                ? firstPage.paperName
                  ? `${firstPage.paperName}（${firstPage.widthMm} × ${firstPage.heightMm} mm）`
                  : `${firstPage.widthMm} × ${firstPage.heightMm} mm`
                : "取得できませんでした"}
            </dd>
          </div>
        </dl>
      </section>

      <ResultList title="エラー" items={grouped.errors} empty="エラーはありません。" />
      <ResultList
        title="注意"
        items={grouped.warnings}
        empty="注意が必要な項目はありません。"
      />
      <ResultList title="OKだった項目" items={grouped.oks} empty="OK項目はありません。" />
    </div>
  );
}

type BatchResultViewProps = {
  reports: CheckReport[];
  ignoredCount: number;
  onReset: () => void;
};

export function BatchResultView({ reports, ignoredCount, onReset }: BatchResultViewProps) {
  const okCount = reports.filter((item) => item.overall === "ok").length;
  const warningCount = reports.filter((item) => item.overall === "warning").length;
  const errorCount = reports.filter((item) => item.overall === "error").length;
  const batchStatus = errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "ok";
  const title =
    reports.length === 1
      ? "1件のチェックが終わりました"
      : `${reports.length}件のチェックが終わりました`;

  return (
    <div className="batch-results">
      <section className={`overall is-${batchStatus}`}>
        <p className="eyebrow">まとめてチェック</p>
        <h2>{title}</h2>
        <p>
          {okCount > 0 ? `問題なし ${okCount}件` : null}
          {okCount > 0 && (warningCount > 0 || errorCount > 0) ? " / " : null}
          {warningCount > 0 ? `注意 ${warningCount}件` : null}
          {warningCount > 0 && errorCount > 0 ? " / " : null}
          {errorCount > 0 ? `エラー ${errorCount}件` : null}
          {okCount === 0 && warningCount === 0 && errorCount === 0 ? "結果がありません。" : null}
        </p>
        {ignoredCount > 0 ? (
          <p>
            一度にチェックできるのは最大{site.maxPdfFiles}ファイルまでです。残りの{ignoredCount}件は今回対象外にしました。
          </p>
        ) : null}
      </section>

      {reports.map((report, index) => (
        <ResultView
          key={`${report.file.name}-${index}`}
          report={report}
          heading={reports.length > 1 ? `${index + 1}件目：${report.file.name || "（名前なし）"}` : undefined}
        />
      ))}

      <button type="button" className="secondary-button" onClick={onReset}>
        別のPDFをチェックする
      </button>
    </div>
  );
}
