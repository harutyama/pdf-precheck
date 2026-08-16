export type PaperSize = {
  name: string;
  widthPt: number;
  heightPt: number;
};

const MM_PER_PT = 25.4 / 72;

export const STANDARD_PAPERS: readonly PaperSize[] = [
  { name: "A3", widthPt: 841.89, heightPt: 1190.55 },
  { name: "A4", widthPt: 595.28, heightPt: 841.89 },
  { name: "A5", widthPt: 419.53, heightPt: 595.28 },
  { name: "B4", widthPt: 728.5, heightPt: 1031.81 },
  { name: "B5", widthPt: 515.91, heightPt: 728.5 },
  { name: "レター", widthPt: 612, heightPt: 792 },
  { name: "リーガル", widthPt: 612, heightPt: 1008 },
];

export const SIZE_TOLERANCE_PT = 4;

export function pointsToMm(points: number): number {
  return points * MM_PER_PT;
}

export function roundMm(mm: number): number {
  return Math.round(mm * 10) / 10;
}

export function identifyPaper(
  widthPt: number,
  heightPt: number,
  tolerancePt = SIZE_TOLERANCE_PT,
): string | null {
  const shortSide = Math.min(widthPt, heightPt);
  const longSide = Math.max(widthPt, heightPt);

  for (const paper of STANDARD_PAPERS) {
    const paperShort = Math.min(paper.widthPt, paper.heightPt);
    const paperLong = Math.max(paper.widthPt, paper.heightPt);
    if (
      Math.abs(shortSide - paperShort) <= tolerancePt &&
      Math.abs(longSide - paperLong) <= tolerancePt
    ) {
      return paper.name;
    }
  }

  return null;
}

export function orientationOf(
  widthPt: number,
  heightPt: number,
): PageInfoOrientation {
  if (Math.abs(widthPt - heightPt) <= SIZE_TOLERANCE_PT) {
    return "square";
  }
  return widthPt > heightPt ? "landscape" : "portrait";
}

export type PageInfoOrientation = "portrait" | "landscape" | "square";

export function formatSizeMm(widthPt: number, heightPt: number): string {
  return `${roundMm(pointsToMm(widthPt))} × ${roundMm(pointsToMm(heightPt))} mm`;
}

export function formatPageLabel(widthPt: number, heightPt: number, paperName: string | null): string {
  const size = formatSizeMm(widthPt, heightPt);
  return paperName ? `${paperName}（${size}）` : size;
}
