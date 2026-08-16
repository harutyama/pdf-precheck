import type { CheckResult, FileMeta } from "../types.ts";

export const FILE_SIZE_SOFT_LIMIT = 10 * 1024 * 1024;
export const FILE_SIZE_HARD_LIMIT = 25 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sizeBucket(bytes: number): string {
  if (bytes <= 0) return "0";
  if (bytes < 1024 * 1024) return "lt_1mb";
  if (bytes < 5 * 1024 * 1024) return "1_5mb";
  if (bytes < 20 * 1024 * 1024) return "5_20mb";
  if (bytes < 50 * 1024 * 1024) return "20_50mb";
  return "gte_50mb";
}

export function checkFileSize(file: FileMeta): CheckResult[] {
  if (file.size <= 0) {
    return [
      {
        id: "file-size",
        title: "ファイルサイズ",
        severity: "error",
        summary: "ファイルサイズが 0 バイトです。",
        action: "別のPDFを選ぶか、元のアプリから書き出し直してください。",
      },
    ];
  }

  const label = formatFileSize(file.size);

  if (file.size >= FILE_SIZE_HARD_LIMIT) {
    return [
      {
        id: "file-size",
        title: "ファイルサイズ",
        severity: "warning",
        summary: `ファイルサイズは ${label} です。多くの提出先で大きすぎます。`,
        detail: "メール添付やWebフォームは 25MB 前後が上限になることが多いです。",
        action: "画質を落とす、ページを分ける、提出先の上限を確認する、のいずれかを検討してください。",
      },
    ];
  }

  if (file.size >= FILE_SIZE_SOFT_LIMIT) {
    return [
      {
        id: "file-size",
        title: "ファイルサイズ",
        severity: "warning",
        summary: `ファイルサイズは ${label} です。提出先によっては大きいことがあります。`,
        detail: "学校・官公庁・企業のフォームでは 10MB 以下を求められることがあります。",
        action: "提出先の上限を確認してください。問題なければこのままで大丈夫です。",
      },
    ];
  }

  return [
    {
      id: "file-size",
      title: "ファイルサイズ",
      severity: "ok",
      summary: `ファイルサイズは ${label} です。`,
    },
  ];
}
