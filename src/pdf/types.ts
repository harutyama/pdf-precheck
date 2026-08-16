export const Severity = {
  ok: "ok",
  warning: "warning",
  error: "error",
} as const;

export type Severity = (typeof Severity)[keyof typeof Severity];

export const OverallStatus = {
  ok: "ok",
  warning: "warning",
  error: "error",
} as const;

export type OverallStatus = (typeof OverallStatus)[keyof typeof OverallStatus];

export type CheckResult = {
  id: string;
  title: string;
  severity: Severity;
  summary: string;
  detail?: string;
  action?: string;
};

export type PageInfo = {
  index: number;
  widthPt: number;
  heightPt: number;
  widthMm: number;
  heightMm: number;
  orientation: "portrait" | "landscape" | "square";
  paperName: string | null;
};

export type PdfSnapshot = {
  pageCount: number;
  pages: PageInfo[];
};

export type FileMeta = {
  name: string;
  size: number;
  mimeType: string;
};

export type ParseFailureReason =
  | "empty"
  | "not_pdf"
  | "encrypted"
  | "corrupt"
  | "unknown";

export type ParseOutcome =
  | { ok: true; snapshot: PdfSnapshot }
  | { ok: false; reason: ParseFailureReason; message: string };

export type ProgressPhase = "reading" | "opening" | "pages" | "evaluating";

export type ProgressState = {
  phase: ProgressPhase;
  message: string;
  currentPage?: number;
  totalPages?: number;
};

export type CheckReport = {
  overall: OverallStatus;
  results: CheckResult[];
  file: FileMeta;
  snapshot: PdfSnapshot | null;
  parseFailure: ParseFailureReason | null;
};

export type ProgressHandler = (progress: ProgressState) => void;
