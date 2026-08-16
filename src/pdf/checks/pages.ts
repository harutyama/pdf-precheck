import { formatPageLabel } from "../pageSizes.ts";
import type { CheckResult, PageInfo, PdfSnapshot } from "../types.ts";

function formatPageList(pages: number[]): string {
  if (pages.length === 0) return "";
  if (pages.length === 1) return `${pages[0]}ページ目`;
  if (pages.length <= 5) {
    return `${pages.join("、")}ページ目`;
  }
  return `${pages.slice(0, 4).join("、")}ページ目ほか計${pages.length}ページ`;
}

function orientationLabel(orientation: PageInfo["orientation"]): string {
  if (orientation === "landscape") return "横向き";
  if (orientation === "portrait") return "縦向き";
  return "正方形";
}

export function checkPageCount(snapshot: PdfSnapshot): CheckResult {
  if (snapshot.pageCount <= 0 || snapshot.pages.length === 0) {
    return {
      id: "page-count",
      title: "ページ数",
      severity: "error",
      summary: "ページが 0 件です。PDFとして中身がありません。",
      action: "元の書類からPDFを書き出し直してください。",
    };
  }

  return {
    id: "page-count",
    title: "ページ数",
    severity: "ok",
    summary: `全${snapshot.pageCount}ページです。`,
  };
}

export function checkPageSizes(snapshot: PdfSnapshot): CheckResult[] {
  if (snapshot.pages.length === 0) {
    return [];
  }

  const groups = new Map<string, number[]>();
  for (const page of snapshot.pages) {
    const key = page.paperName ?? formatPageLabel(page.widthPt, page.heightPt, null);
    const list = groups.get(key) ?? [];
    list.push(page.index);
    groups.set(key, list);
  }

  const unique = [...groups.entries()];
  const first = snapshot.pages[0];
  const firstLabel = formatPageLabel(first.widthPt, first.heightPt, first.paperName);

  if (unique.length === 1) {
    const [name] = unique[0];
    if (first.paperName) {
      return [
        {
          id: "page-size",
          title: "ページサイズ",
          severity: "ok",
          summary: `すべてのページが ${name} です。`,
          detail: firstLabel,
        },
      ];
    }

    return [
      {
        id: "page-size",
        title: "ページサイズ",
        severity: "warning",
        summary: `ページサイズは ${name} で、一般的な用紙サイズではありません。`,
        detail: "A4 など指定の用紙と違うと、印刷や提出で余白が崩れることがあります。",
        action: "提出先が指定する用紙（多くの場合はA4）になっているか確認してください。",
      },
    ];
  }

  const mix = unique
    .map(([name, pages]) => `${name}（${formatPageList(pages)}）`)
    .join(" / ");

  return [
    {
      id: "page-size",
      title: "ページサイズ",
      severity: "warning",
      summary: "ページによって用紙サイズが混在しています。",
      detail: mix,
      action: "すべてのページを同じ用紙サイズにそろえてから提出してください。",
    },
  ];
}

export function checkOrientation(snapshot: PdfSnapshot): CheckResult[] {
  if (snapshot.pages.length === 0) {
    return [];
  }

  const groups = new Map<PageInfo["orientation"], number[]>();
  for (const page of snapshot.pages) {
    const list = groups.get(page.orientation) ?? [];
    list.push(page.index);
    groups.set(page.orientation, list);
  }

  if (groups.size === 1) {
    const orientation = snapshot.pages[0].orientation;
    return [
      {
        id: "orientation",
        title: "ページの向き",
        severity: "ok",
        summary: `すべてのページが${orientationLabel(orientation)}です。`,
      },
    ];
  }

  const landscape = groups.get("landscape") ?? [];
  const portrait = groups.get("portrait") ?? [];
  const square = groups.get("square") ?? [];

  let summary = "ページによって縦向きと横向きが混在しています。";
  let detail = "";
  if (portrait.length && landscape.length && landscape.length <= portrait.length) {
    summary = `${formatPageList(landscape)}だけ横向きです。`;
    detail = `縦向き: ${portrait.length}ページ / 横向き: ${landscape.length}ページ`;
  } else if (portrait.length && landscape.length) {
    summary = `${formatPageList(portrait)}だけ縦向きです。`;
    detail = `縦向き: ${portrait.length}ページ / 横向き: ${landscape.length}ページ`;
  }
  if (square.length) {
    detail = [detail, `正方形: ${formatPageList(square)}`].filter(Boolean).join(" / ");
  }

  return [
    {
      id: "orientation",
      title: "ページの向き",
      severity: "warning",
      summary,
      detail: detail || undefined,
      action: "意図したレイアウトか確認してください。提出先が縦向き指定なら、横向きページを直してください。",
    },
  ];
}

export function pageCountBucket(count: number): string {
  if (count <= 0) return "0";
  if (count === 1) return "1";
  if (count <= 10) return "2_10";
  if (count <= 50) return "11_50";
  if (count <= 200) return "51_200";
  return "gte_200";
}
