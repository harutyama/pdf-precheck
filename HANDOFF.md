# HANDOFF

別のChatGPT / Cursorが、このファイルだけを読んで続きの指示を出せるように書いた引き継ぎです。人間向けの短い要約ではなく、実装・公開・運用の事実を正確に書いてある。

最終更新: 2026-08-16

作業フォルダ: `/Users/hr/Developer/pdf-precheck`  
旧Goツール `file-organizer`（`/Users/hr/Developer/GoStudy/file-organizer`）とは無関係の新規プロジェクト。

オーナーはプログラミング初学者。実装はCursorが主体。アカウント作成・ログイン・秘密情報の入力だけオーナーが行った。コミットは依頼時が原則。自動公開に必要な変更は `main` へ push 済み。

## プロジェクト概要

「PDF提出前チェッカー」という、一般公開済みのWebサービス。

学習用サンプルではなく、知らないユーザーがURLで使える提出前チェックが目的。PDF変換サービスではない。

ユーザーがPDFを最大10ファイルまでまとめてドラッグ＆ドロップすると、提出・納品前に問題のありそうな体裁をブラウザ内でチェックする。

必須条件（初期版で維持）:

- 一般公開
- 初期維持費 0 円
- ユーザー登録なし、ログインなし、DBなし
- 利用回数制限なし、完全無料
- PDFをサーバーへアップロードしない。解析はブラウザ内
- スマートフォンでも最低限使える
- 将来の FREE / PRO（認証・DB・課金・カスタムチェック）を妨げない
- 初期版に課金は実装しない

サービス名は `src/config/site.ts` の `site.name`、同時チェック上限は `site.maxPdfFiles`。

プライバシー文言（画面に表示）:

「PDFはサーバーへ送信されず、お使いのブラウザ内で処理されます。そのため、内容が外部に送られず、セキュリティ面でも安全性が高いです。」

## 現在の完成状況

一般公開済み。広告なし。訪問しても広告収入は入らない。

動作しているもの:

- 公開サイトでPDFチェックできる
- ドラッグ＆ドロップ / ファイル選択
- 最大10ファイルまで同時チェック（11件以上は先頭10件。上限は文言で表示）
- 進捗表示
- OK / 注意 / エラー。注意には「何が問題か」「何を確認すればよいか」
- 複数ファイル時はバッチ要約 ＋ ファイルごとの詳細
- プライバシーページ `/privacy`
- 存在しないURL（`/admin` 含む）は「ページが見つかりません」。Analyticsデータは出さない
- 自動テスト、lint、production build
- GitHub 公開リポジトリ
- Cloudflare Pages 公開
- GitHub Actions による自動デプロイ（成功確認済み）
- GA4 計測（リアルタイムに数字が出ることをオーナーが確認済み）

公開URL: https://pdf-precheck.pages.dev/  
GitHub: https://github.com/harutyama/pdf-precheck （公開リポジトリ。メリット・デメリットはオーナーへ説明済み。非公開化の依頼はまだない）

## 使用技術

| 分類 | 採用 | バージョン目安 |
| --- | --- | --- |
| 言語 | TypeScript | ~6.0 |
| UI | React | 19.2 |
| バンドラ | Vite | 8.2 |
| PDF読み込み | pdfjs-dist（Mozilla PDF.js, Apache-2.0） | 6.2.108（legacy build + worker） |
| テスト | Vitest | 4.1 |
| テスト用PDF生成 | pdf-lib（devDependencyのみ） | 1.17 |
| Lint | oxlint | 1.75 |
| Analytics | Google Analytics 4 | 測定ID `G-0VFESK32C6` をビルド時注入 |
| 公開先 | Cloudflare Pages | https://pdf-precheck.pages.dev/ |
| CI/CD | GitHub Actions | `main` push で lint/test/build/deploy |

Node.js 22.13 以降が必要。開発マシンには Homebrew で Node 26 を入れた。

GitHubユーザー: `harutyama`  
Cloudflareアカウント: `neymar05253453@gmail.com`  
Cloudflare Account ID: `06658c14091c08107f0214676a982e95`  
Pagesプロジェクト名: `pdf-precheck`  
本番ブランチ: `main`

デプロイコマンド相当: `npx wrangler pages deploy dist --project-name=pdf-precheck --branch=main`  
Pagesは当初 wrangler 直接アップロードで作成。Git連携ではなく GitHub Actions からの直接アップロード。`pages.dev` URLは維持。

## 技術選定理由

- Vite + React + TypeScript: 静的ホストに出しやすく、Cursorでの修正もしやすい。過剰なバックエンドを作らない。
- PDF.js: ブラウザ内PDF解析の標準。メンテが続いている。暗号化PDFは `PasswordException` で検出できる。
- 独自サーバー / DB なし: 維持費0円と「PDFを送らない」を同時に満たす。
- Cloudflare Pages: 無料枠で静的リクエストと帯域が実質無制限。PDFアップロード用サーバーが不要なこの構成に合う。
- GA4: カスタムイベント、日別、流入元、端末、ブラウザ、ユニークユーザーの目安を、無料の公式ダッシュボードで見られる。
- 独自 `/admin` は作らない: 下記「管理者画面」を参照。
- 自動デプロイは GitHub Actions: 既存の Direct Upload プロジェクトを同じURLのまま更新できる。

使わなかったもの:

- 独自ログイン / Cloudflare Access 付き管理画面: 初期のDBなし・0円・秘密情報をフロントに出さない、と両立しにくい。
- Plausible / Umami 有料クラウド: 0円条件に合わない。
- Cloudflare Web Analytics だけ: ページ閲覧は見られるが、PDFチェック回数などのカスタムイベントが不足。
- 広告（AdSense等）: 初期の信頼感と相性が悪い。未導入。

## ディレクトリ構成

```text
src/config/site.ts          サービス名、最大ファイル数、プライバシー文言
src/files/selectFiles.ts    複数ファイルの上限カット
src/pdf/parsePdf.ts         PDF.jsでページ情報を取る
src/pdf/evaluate.ts         スナップショットから判定（純関数）
src/pdf/runChecks.ts        ファイル選択からレポート作成
src/pdf/checks/             ファイル名、サイズ、ページ、向き
src/pdf/pageSizes.ts        A4等の判定
src/analytics/ga.ts         gtag読み込み。公式どおり arguments を dataLayer に積む
src/analytics/events.ts     匿名イベント。filename等は除去
src/pages/HomePage.tsx      メイン画面（複数ファイル対応）
src/pages/PrivacyPage.tsx   プライバシー
src/pages/NotFoundPage.tsx  不明URL（/admin含む）
src/ui/                     DropZone, ResultView, BatchResultView など
public/_headers             CSP等（GA用に googletagmanager の connect-src を含む）
public/_redirects           SPAフォールバック
.github/workflows/ci.yml    lint/test/build
.github/workflows/deploy.yml main push で Pages へデプロイ
.env.example                VITE_GA_MEASUREMENT_ID
HANDOFF.md                  このファイル
```

## 実装済みPDFチェック

| 項目 | 内容 |
| --- | --- |
| 読み込み | PDFとして開けるか |
| 空ファイル | 0バイトはエラー |
| 非PDF | `%PDF` が無く、PDF.jsも失敗したらエラー |
| 破損 | ヘッダーはあるが読めない |
| 暗号化 | PasswordException をエラーとして検出 |
| ページ数 | 0ページはエラー。1ページ以上はOK |
| ファイルサイズ | 実サイズ表示。10MB以上注意、25MB以上はより強い注意 |
| ページサイズ | A3/A4/A5/B4/B5/レター/リーガル。非標準・混在は注意 |
| 向き | 全ページ同じならOK。混在は注意（例: 3ページ目だけ横向き） |
| ファイル名 | 拡張子、危険な記号、予約名、コピー/(1)、不可視文字、長さ |
| 同時処理 | 最大10ファイル。`takePdfFiles` でカット |

初期版から外したもの（誤判定しやすい、またはブラウザだけでは不十分）:

- フォント埋め込み
- 画像解像度
- OCR / 文字化け
- 印刷用トンボ・塗り足し
- 色空間
- 中身の文章チェック

## 判定基準

総合結果（1ファイル）:

1. エラーが1件でもあれば総合エラー
2. エラーが無く、注意が1件以上なら総合注意
3. それ以外は総合OK

複数ファイル時は、ファイルごとの総合結果を集計してバッチ要約（問題なしN / 注意N / エラーN）を出す。

個別の例:

- 「全12ページです」→ OK
- 「3ページ目だけ横向きです」→ 注意。確認すること付き
- 「PDFを正常に読み込めませんでした」→ エラー
- 「パスワードで保護されたPDFです」→ エラー
- すべてA4 → OK
- A4とレターが混在 → 注意
- すべて同じだが非標準サイズ → 注意
- 10MB未満 → サイズOK
- 10MB以上 → 注意（提出先上限の確認を促す）

## Analytics

採用: Google Analytics 4

理由:

- 無料
- カスタムイベントが使える
- ページアクセス、ユニークユーザー目安、日別、流入元、端末、ブラウザが標準で見られる
- 管理者認証は Google アカウント側で済む
- フロントに置いてよいのは測定IDだけ（秘密鍵ではない）

測定ID: `G-0VFESK32C6`  
保存: GitHub Secrets の `VITE_GA_MEASUREMENT_ID`（Viteはビルド時に埋め込む。ソースへ直書きしない）  
確認: https://analytics.google.com/ （オーナーの Google アカウントのみ）  
ストリーム名: `pdf-prechecker`  
サイトURL: `https://pdf-precheck.pages.dev`

イベント（ファイル名、PDF本文、画像は送らない）:

| イベント | パラメータ | 送らないもの |
| --- | --- | --- |
| page_view | GA4標準 | ファイル名、PDF内容 |
| pdf_selected | size_bucket | ファイル名 |
| check_started | size_bucket | ファイル名 |
| check_succeeded | size_bucket, page_count_bucket, result | ファイル名、本文 |
| check_failed | reason, size_bucket | ファイル名、本文 |
| batch_completed | file_count, ok_count, warning_count, error_count | ファイル名、本文 |

`reason` は `empty | not_pdf | encrypted | corrupt | unknown` のみ。  
`size_bucket` は `0 | lt_1mb | 1_5mb | 5_20mb | 20_50mb | gte_50mb`。  
`page_count_bucket` は `0 | 1 | 2_10 | 11_50 | 51_200 | gte_200`。

実装上の注意:

- `src/analytics/ga.ts` は Google 公式と同じく `dataLayer.push(arguments)` を使う。配列を積むと計測されないことがある。一度それでリアルタイムに出ず、修正後に成功。
- 「インストールをテスト」「タグの実装手順を表示」は不要。`index.html` に公式スニペットは貼っていない。
- GA4のウェブストリーム詳細に「データ収集が有効になっていません」と出ることがある。作成直後は普通。リアルタイムで確認済み。
- 日別レポートは半日〜1日遅れることがある。
- 広告ブロックがオンだとリアルタイムに出ないことがある。

## 管理者画面 / アクセス制限

優先順位: 実データ保護 > 秘密情報をフロントに出さない > 0円 > 確認しやすい > 独自UI。

### 結論

独自の `/admin` ダッシュボードは実装していない。  
管理者画面は Google Analytics 公式ダッシュボードを使う。

これは「管理画面のUIが未完成」ではない。  
「実データを独自画面に出すと、秘密鍵か公開APIが必要になり、この段階の制約と安全要件を同時に満たせない」ための意図的な選択。

- 管理者画面のURL: https://analytics.google.com/ （このWebアプリの `/admin` ではない）
- 採用した認証・アクセス制御: Google アカウントによる GA4 権限。このアプリ内に管理者ログインは無い
- なぜその方式か: 独自 `/admin` で実データを出すには Google Analytics Data API のサービスアカウント鍵が必要。鍵をフロントや `VITE_` 環境変数に置くのは禁止。鍵を守るサーバー/Workersを足すと、DBなし・0円・単純さの条件が崩れる
- 管理者本人のログイン方法: 自分のGoogleアカウントで analytics.google.com を開く
- 一般ユーザーが `/admin` にアクセスすると: 他の不明URLと同じ「ページが見つかりません」。Analyticsデータは出ない
- Analytics実データの取得元: このアプリのAPIからは取得していない。GA4公式画面のみ
- 秘密情報の管理場所: リポジトリに秘密鍵は無い。測定IDは公開前提。Cloudflare APIトークンと測定IDは GitHub Secrets。トークンの値をソースやこのファイルに書かない
- 公開時に手動設定するもの: 済（GA4、測定ID、GitHub Secrets、Cloudflareトークン）。自分以外にGA4権限を渡さないこと
- 今、アクセス制限は有効か:
  - 独自管理画面: 存在しない。実データも出さない
  - GA4公式画面: オーナーの Google アカウントだけで閲覧できる。測定ID設定済み。リアルタイム確認済み

禁止（守ること）:

- URLを知っているだけで管理画面や実データを見られるようにする
- JS内に管理者パスワードを書く
- フロントの環境変数に秘密鍵を入れる
- localStorage だけで管理者判定する
- URL秘匿だけの認証

将来どうしても独自 `/admin` が必要なら、Cloudflare Access で保護し、Analytics取得は Workers 側だけが鍵を持つ。初期版ではやらない。

「管理者画面完成」とは言えない。正確には「管理者確認手段はGA4公式画面。独自 `/admin` は意図的に未実装」。

## プライバシー

- PDF処理場所: ユーザーのブラウザ。`src/pdf/parsePdf.ts` の PDF.js
- サーバーアップロード: なし
- 外部へ送る情報: GA4 のページ閲覧と上記の匿名イベント
- 送らない情報: PDFバイナリ、本文、画像、ファイル名、ページの中身
- 広告タグ・追加の外部フォントは使っていない
- CSP とセキュリティヘッダーは `public/_headers`

## テスト状況

実行日: 2026-08-16（GA修正後の lint/test/build も成功）

```text
npm run lint   … 成功
npm test       … 成功（8ファイル / 40テスト）
npm run build  … 成功。PDF.jsは別チャンク（parsePdf + worker）
```

自動テストで見ているもの:

- 正常なA4
- 1ページ
- 複数ページ（12ページ）
- 縦横混在
- ページサイズ混在
- 非PDF
- 空ファイル
- 壊れたPDFヘッダー
- 暗号化は PasswordException 相当オブジェクトで分類テスト
- ファイル名の危険な文字、コピー、(1)、不可視文字
- 10MB / 25MB のサイズ注意
- Analyticsペイロードにファイル名が入らないこと
- 複数ファイル選択の上限（12件中10件）

実ファイルのパスワード付きPDFを使う結合テストは未実施。

## 公開状況

- 現在: Cloudflare Pages で公開済み
- 公開URL: https://pdf-precheck.pages.dev/
- GitHub: https://github.com/harutyama/pdf-precheck （公開）
- 自動デプロイ: `.github/workflows/deploy.yml`。`main` への push で公開サイトが更新される
- GitHub Secrets（値はここに書かない）:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
  - `VITE_GA_MEASUREMENT_ID`
- 広告: なし。収入なし
- 残作業: 必須作業は一通り完了。任意でカスタムドメイン、GitHubの公開/非公開の見直し

## やってきた時系列

1. 新規 Vite + React プロジェクト作成（旧Goツールとは別フォルダ）
2. ブラウザ内PDFチェック実装、テスト、lint、build
3. Git 初期コミット
4. GitHub 公開リポジトリ作成・push
5. `wrangler login` 後、Cloudflare Pages に公開
6. 仕様変更: 最大10ファイル同時処理、上限文言、プライバシー文の後ろにセキュリティ説明
7. GitHub Actions 自動デプロイ追加。オーナーが Cloudflare API トークン作成。Secret 登録。デプロイ成功
8. オーナーが GA4 ウェブストリーム作成。測定ID `G-0VFESK32C6`。Secret 登録して再デプロイ
9. リアルタイムに出ず。`gtag` の dataLayer 積載バグを修正して再デプロイ。その後リアルタイム成功
10. 広告未導入。GitHubは公開のまま

## 未実装

- 独自 `/admin`（意図的）
- 課金、アカウント、DB、回数制限
- ユーザー独自チェック条件、条件セット保存
- OGP画像
- 実在の暗号化PDFファイルを使う自動テスト
- フォント埋め込み等の高度なプリフライト
- カスタムドメイン
- 広告

## 既知の問題 / 制限

- 超巨大PDFはブラウザメモリに載せる。数十MBは注意表示するが、端末によっては重い
- ページサイズ判定は MediaBox/Viewport ベース。印刷の仕上がりサイズまでは見ない
- 一部の特殊なPDFは PDF.js が読めず `corrupt` / `unknown` になる
- 暗号化PDFの自動テストは例外分類まで
- GA4は利用データ（ページ閲覧等）をGoogleへ送る。PDF内容は送らない
- 一度にチェックできるのは最大10ファイル
- GitHub 公開リポジトリなので、ソースは誰でも見られる

## 将来のPRO版

今は実装しない。足しにくくならないようにした点:

- 判定ロジックは `src/pdf/` に閉じている。UIはレポートを描画するだけ
- チェックは関数の組み合わせ。後から「有効なチェック一覧」を差し替えられる
- 認証・決済・DBのコードはまだ無い。後から足すときは `src/pdf` に混ぜない
- 回数制限が必要になったら、サーバー側の判定を挟み、ブラウザ判定はそのまま使える
- 独自条件セットは `CheckResult` を返す関数を追加する形が自然
- 複数ファイル同時チェックは初期版で実装済み。PROの差別化にはしない
- 今の「回数無制限・登録なし」はプロダクト方針であり、解析エンジンとは独立

やってはいけないこと:

- チェック関数の中にログイン状態を埋め込む
- ファイル名やPDFをAnalyticsやサーバーログに出す
- 管理者パスワードをフロントに書く
- 秘密情報をリポジトリにコミットする

## 次にやること

必須作業は完了。優先度は低い任意項目のみ。

1. 必要ならカスタムドメイン
2. 必要なら GitHub リポジトリを非公開化（依頼があれば手順案内。サイトURLはそのまま使える）
3. 公開後しばらく使ってから PRO / 広告 / 機能追加の要否を判断する

## ChatGPTへの引き継ぎ

今の状態を一文で言うと:

「ブラウザ内だけで動くPDF提出前チェッカーは https://pdf-precheck.pages.dev/ で一般公開済み。最大10ファイルまで同時チェック。GitHub公開リポジトリは https://github.com/harutyama/pdf-precheck 。Cloudflare Pages へ GitHub Actions で自動デプロイ。GA4測定ID `G-0VFESK32C6` は GitHub Secrets 経由でビルド注入し、リアルタイム確認済み。管理者画面は独自 `/admin` ではなく analytics.google.com。広告なし、登録なし、PDFはサーバー非送信。」

次の指示の出し方:

- 機能追加: `src/pdf/checks/` に純関数を追加し、`evaluate.ts` から呼ぶ。UIは `CheckResult` を描画する
- 名称変更: `src/config/site.ts`
- 同時ファイル数変更: `site.maxPdfFiles`
- `/admin` を作れ: フロントだけで作らない。方針はGA公式画面。どうしてもなら Cloudflare Access + サーバー側鍵
- 非公開リポジトリ化: 依頼があれば手順案内
- Analytics: 設定済み。スクリプトを `index.html` に貼らない
- 秘密情報をリポジトリに置かない。`VITE_` に秘密鍵を入れない。測定IDは公開前提
- オーナーには初心者向けに1ステップずつ。ログインや支払いを代行しない
- `main` へ push すると公開サイトが自動更新される
- コミットは依頼時が原則
```
