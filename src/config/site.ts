export const site = {
  name: "PDF提出前チェッカー",
  shortName: "PDFチェッカー",
  tagline: "提出・納品の前に、ブラウザだけで最終確認。",
  description:
    "PDFをサーバーに送らず、提出前にページサイズや向き、ファイル名などをブラウザ内でチェックします。",
  privacyLine:
    "PDFはサーバーへ送信されず、お使いのブラウザ内で処理されます。",
  privacySecurityLine:
    "そのため、内容が外部に送られず、セキュリティ面でも安全性が高いです。",
  maxPdfFiles: 10,
  url: "https://pdf-precheck.pages.dev",
} as const;

export type SiteConfig = typeof site;

export function privacyNotice(): string {
  return `${site.privacyLine}${site.privacySecurityLine}`;
}

