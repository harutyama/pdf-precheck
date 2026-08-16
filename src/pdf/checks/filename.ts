import type { CheckResult, FileMeta } from "../types.ts";

const WINDOWS_RESERVED = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

const UNSAFE_CHARS = /[\\/:*?"<>|]/;
const DRAFT_HINT =
  /コピー|のｺﾋﾟｰ|コピーの|\bcopy\b|\(1\)|（1）|\[\s*1\s*\]|最終の最終|untitled|無題/i;

function baseName(name: string): string {
  const slash = Math.max(name.lastIndexOf("/"), name.lastIndexOf("\\"));
  return slash >= 0 ? name.slice(slash + 1) : name;
}

function hasInvisibleOrControlChars(name: string): boolean {
  for (const char of name) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 31 || code === 127) return true;
    if (code >= 0x200b && code <= 0x200f) return true;
    if (code >= 0x202a && code <= 0x202e) return true;
    if (code === 0x2060 || code === 0xfeff) return true;
  }
  return false;
}

function stemAndExt(fileName: string): { stem: string; ext: string } {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) {
    return { stem: fileName, ext: "" };
  }
  return {
    stem: fileName.slice(0, lastDot),
    ext: fileName.slice(lastDot + 1),
  };
}

export function checkFilename(file: FileMeta): CheckResult[] {
  const results: CheckResult[] = [];
  const name = baseName(file.name ?? "");

  if (!name.trim()) {
    results.push({
      id: "filename-empty",
      title: "ファイル名",
      severity: "error",
      summary: "ファイル名が空です。",
      action: "わかりやすい名前を付けてから、もう一度提出用ファイルを保存してください。",
    });
    return results;
  }

  results.push({
    id: "filename-value",
    title: "ファイル名",
    severity: "ok",
    summary: `ファイル名は「${name}」です。`,
  });

  const { stem, ext } = stemAndExt(name);

  if (ext.toLowerCase() !== "pdf") {
    results.push({
      id: "filename-extension",
      title: "拡張子",
      severity: "warning",
      summary: "拡張子が .pdf ではありません。",
      detail: "提出先によっては、PDFとして認識されないことがあります。",
      action: "本当にPDFかどうか確認し、必要なら .pdf で保存し直してください。",
    });
  } else {
    results.push({
      id: "filename-extension",
      title: "拡張子",
      severity: "ok",
      summary: "拡張子は .pdf です。",
    });
  }

  if (hasInvisibleOrControlChars(name)) {
    results.push({
      id: "filename-invisible",
      title: "ファイル名の文字",
      severity: "error",
      summary: "ファイル名に見えない文字や制御文字が含まれています。",
      action: "名前を打ち直して保存し直してください。コピー＆ペーストは避けた方が安全です。",
    });
  }

  if (UNSAFE_CHARS.test(name)) {
    results.push({
      id: "filename-unsafe",
      title: "ファイル名の記号",
      severity: "warning",
      summary: "ファイル名に、提出先やWindowsで問題になりやすい記号があります。",
      detail: "\\ / : * ? \" < > | は使わない方が安全です。",
      action: "ハイフンやアンダーバーだけを使った名前に変更してください。",
    });
  }

  if (name !== name.trim() || stem !== stem.trim() || stem.endsWith(".")) {
    results.push({
      id: "filename-whitespace",
      title: "ファイル名の空白",
      severity: "warning",
      summary: "ファイル名の前後に空白があるか、末尾が不自然です。",
      action: "前後の空白を消して、もう一度保存してください。",
    });
  }

  if (name.includes("　") || name.includes("  ")) {
    results.push({
      id: "filename-spaces",
      title: "ファイル名のスペース",
      severity: "warning",
      summary: "全角スペース、または連続したスペースがあります。",
      action: "半角スペース1つ、またはアンダーバーに置き換えてください。",
    });
  }

  if (WINDOWS_RESERVED.has(stem.toUpperCase())) {
    results.push({
      id: "filename-reserved",
      title: "予約語のファイル名",
      severity: "warning",
      summary: "Windowsで使えない予約名になっています。",
      action: "報告書や日付など、中身が分かる名前に変更してください。",
    });
  }

  if (name.length > 180) {
    results.push({
      id: "filename-long",
      title: "ファイル名の長さ",
      severity: "warning",
      summary: "ファイル名が長すぎます。",
      detail: "一部の提出フォームやメールでは、長い名前がエラーになることがあります。",
      action: "180文字以内の短い名前にしてください。",
    });
  }

  if (DRAFT_HINT.test(name)) {
    results.push({
      id: "filename-draft",
      title: "下書きっぽいファイル名",
      severity: "warning",
      summary: "コピーや仮の名前に見えるファイル名です。",
      detail: "「コピー」や「(1)」が残っていると、提出用の最終版に見えないことがあります。",
      action: "提出用だと分かる名前に直してください。",
    });
  }

  return results;
}
