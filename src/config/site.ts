export const site = {
  name: "PDF提出前チェッカー",
  shortName: "PDFチェッカー",
  tagline: "提出・納品の前に、ブラウザだけで最終確認。",
  description:
    "PDFをサーバーに送らず、提出前にページサイズや向き、ファイル名などをブラウザ内でチェックします。",
  privacyLine:
    "PDFはサーバーへ送信されず、お使いのブラウザ内で処理されます。",
  url: "",
} as const;

export type SiteConfig = typeof site;
