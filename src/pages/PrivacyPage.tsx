import { privacyNotice } from "../config/site.ts";

export function PrivacyPage() {
  return (
    <article className="prose">
      <h1>プライバシー</h1>
      <p>{privacyNotice()}</p>
      <h2>PDFの扱い</h2>
      <p>
        選択したPDFは、このサービスのサーバーへアップロードされません。読み込みとチェックは、お使いのブラウザの中だけで行います。そのため、内容が外部に送られず、セキュリティ面でも安全性が高いです。
      </p>
      <p>
        ファイル名やPDFの中身を、解析用の外部サービスへ送ることもありません。
      </p>
      <h2>利用状況の確認</h2>
      <p>
        公開後の利用状況を把握するため、Google Analytics 4 を使う場合があります。送るのはページ閲覧や「チェックを開始した／成功した／失敗した」といった匿名の利用イベントだけです。ファイル名やPDFの中身は送りません。
      </p>
      <p>
        ファイル名、PDFの本文、ページの画像、個人が特定できる入力内容は Analytics に送りません。
      </p>
      <h2>アカウント</h2>
      <p>ユーザー登録、ログイン、Cookieによる追跡広告は使いません。</p>
    </article>
  );
}
