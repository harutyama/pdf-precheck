# PDF提出前チェッカー

提出・納品の前に、PDFの体裁をブラウザだけで確認するWebサービスです。

PDFファイルはサーバーへ送信されません。読み込みとチェックは、利用者のブラウザ内で完結します。そのため、内容が外部に送られず、セキュリティ面でも安全性が高いです。

ユーザー登録、ログイン、利用回数制限はありません。初期版は完全無料です。
一度に最大10ファイルまでチェックできます。

## 主な機能

- PDFのドラッグ＆ドロップ、またはファイル選択（最大10ファイルまで）
- ブラウザ内での自動チェック
- 処理中の進捗表示
- 総合結果（OK / 注意 / エラー）
- ページ数、用紙サイズ、向き、ファイル名、ファイルサイズ、パスワード保護の確認
- 注意項目では「何が問題か」と「何を確認すればよいか」を表示

## 使用技術

- React 19
- TypeScript 6
- Vite 8
- Mozilla PDF.js（`pdfjs-dist` 6、Apache-2.0）
- Vitest 4
- Google Analytics 4（利用状況の確認。未設定なら送信しない）
- 公開先: Cloudflare Pages（https://pdf-precheck.pages.dev/）

## ローカルでの起動方法

必要環境: Node.js 22.13 以降

```bash
npm install
npm run dev
```

ブラウザで表示された URL（通常は `http://localhost:5173`）を開きます。

## ビルド方法

```bash
npm run build
npm run preview
```

本番用ファイルは `dist/` に出力されます。

## テスト方法

```bash
npm test
npm run lint
```

## ディレクトリ構成

```text
src/
  analytics/     Analytics送信（ファイル名やPDF内容は送らない）
  config/site.ts サービス名、最大ファイル数など
  files/         複数ファイル選択の上限処理
  pages/         画面
  pdf/           PDF解析とチェック（UIから分離）
  ui/            画面部品
  test/          テスト用セットアップ
public/          favicon、Cloudflare Pages用ヘッダー
```

重要な境界:

- `src/pdf/` … PDFを読んで判定する
- `src/pages/` と `src/ui/` … 画面表示だけを担当する
- `src/analytics/` … 匿名の利用イベントだけを送る

## Analytics設定

1. Google Analytics 4 でプロパティを作成する
2. 測定ID（`G-` から始まる値）を控える
3. リポジトリの `.env.example` を参考に、公開環境へ `VITE_GA_MEASUREMENT_ID` を設定する

未設定のままビルドすると、Analytics は読み込まれません。

送るイベント:

- ページ閲覧（GA4標準）
- `pdf_selected`
- `check_started`
- `check_succeeded`
- `check_failed`
- `batch_completed`（何件まとめてチェックしたか。ファイル名は含まない）

ファイル名、PDF本文、個人が特定できる情報は送りません。

管理者向けの数字確認は、このサイトの `/admin` ではなく、[Google Analytics](https://analytics.google.com/) の公式画面を使います。理由は `HANDOFF.md` を見てください。

## 公開方法

公開URL: https://pdf-precheck.pages.dev/

`main` への push で GitHub Actions が Cloudflare Pages へデプロイします。必要な GitHub Secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `VITE_GA_MEASUREMENT_ID`（任意。未設定なら Analytics は送らない）

手動公開する場合:

```bash
npm run build
npx wrangler pages deploy dist --project-name=pdf-precheck --branch=main
```

## プライバシー上の設計

- PDFはサーバーへアップロードしない
- 内容が外部に送られないため、セキュリティ面でも安全性を高くしている
- 解析はブラウザ内の PDF.js だけで行う
- Analytics には匿名の利用イベントだけを送る
- 測定ID以外の秘密情報はソースコードに置かない
- 独自の管理者APIは持たない（秘密鍵をブラウザへ配らないため）

## 今後追加予定の機能

初期版には課金機能はありません。将来の候補:

- 1日あたりの回数制限（FREE）
- 回数無制限、独自チェック条件、条件セット保存（PRO）
- アカウント、ログイン、DB、決済

現在のコードは、PDF判定と画面を分けてあるので、後から認証や課金を足しやすくしています。
