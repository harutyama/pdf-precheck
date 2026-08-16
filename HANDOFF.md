# HANDOFF

別のChatGPT / Cursorが、このファイルだけを読んで続きの指示を出せるように書いた引き継ぎです。

作業フォルダ: `/Users/hr/Developer/pdf-precheck`  
旧Goツール `file-organizer` とは無関係の新規プロジェクトです。

## プロジェクト概要

「PDF提出前チェッカー」という、一般公開向けWebサービス。

ユーザーがPDFを最大10ファイルまでまとめてドラッグ＆ドロップすると、提出・納品前に問題のありそうな体裁をブラウザ内でチェックする。

必須条件:

- ユーザー登録なし、ログインなし、DBなし
- 利用回数制限なし、完全無料
- PDFをサーバーへアップロードしない
- 初期維持費 0 円
- スマートフォンでも最低限使える
- 将来の FREE / PRO 追加を妨げない

サービス名は `src/config/site.ts` の `site.name`、同時チェック上限は `site.maxPdfFiles` を変えればまとめやすい。

## 現在の完成状況

ローカル実装は一通り動く。

動作しているもの:

- トップページでのPDF選択 / ドロップ（最大10ファイル）
- ブラウザ内PDF解析
- OK / 注意 / エラーの結果表示（複数ファイルは一覧）
- 進捗表示
- プライバシーページ `/privacy`
- 存在しないURLは 404 相当（`/admin` も含む）
- 自動テスト、lint、production build
- Analytics送信の土台（測定IDが無いときは何も送らない）
- Cloudflare Pages 公開: https://pdf-precheck.pages.dev/
- GitHub: https://github.com/harutyama/pdf-precheck
- GitHub Actions による自動デプロイワークフロー（Secrets 設定後に有効）

## 使用技術

| 分類 | 採用 | バージョン目安 |
| --- | --- | --- |
| 言語 | TypeScript | ~6.0 |
| UI | React | 19.2 |
| バンドラ | Vite | 8.2 |
| PDF読み込み | pdfjs-dist（Mozilla PDF.js, Apache-2.0） | 6.2.108 |
| テスト | Vitest | 4.1 |
| テスト用PDF生成 | pdf-lib（devDependencyのみ） | 1.17 |
| Lint | oxlint | 1.75 |
| Analytics | Google Analytics 4 | 測定IDを環境変数で注入 |
| 公開先 | Cloudflare Pages | https://pdf-precheck.pages.dev/ |

Node.js 22.13 以降が必要。開発マシンには Homebrew で Node 26 を入れた。

## 技術選定理由

- Vite + React + TypeScript: 静的ホストに出しやすく、Cursorでの修正もしやすい。過剰なバックエンドを作らない。
- PDF.js: ブラウザ内PDF解析の標準。メンテが続いている。暗号化PDFは `PasswordException` で検出できる。
- 独自サーバー / DB なし: 維持費0円と「PDFを送らない」を同時に満たす。
- Cloudflare Pages: 無料枠で静的リクエストと帯域が実質無制限。PDFアップロード用サーバーが不要なこの構成に合う。Vercel / Netlify より帯域上限の心配が少ない。
- GA4: カスタムイベント、日別、流入元、端末、ブラウザ、ユニークユーザーの目安を、無料の公式ダッシュボードで見られる。
- 独自 `/admin` は作らない: 下記「管理者画面」を参照。

使わなかったもの:

- 独自ログイン / Cloudflare Access 付き管理画面: 初期のDBなし・0円・秘密情報をフロントに出さない、と両立しにくい。
- Plausible / Umami 有料クラウド: 0円条件に合わない。
- Cloudflare Web Analytics だけ: ページ閲覧は見られるが、PDFチェック回数などのカスタムイベントが不足。

## ディレクトリ構成

```text
src/config/site.ts          サービス名、最大ファイル数、プライバシー文言
src/files/selectFiles.ts    複数ファイルの上限カット
src/pdf/parsePdf.ts         PDF.jsでページ情報を取る
src/pdf/evaluate.ts         スナップショットから判定（純関数）
src/pdf/runChecks.ts        ファイル選択からレポート作成
src/pdf/checks/             ファイル名、サイズ、ページ、向き
src/pdf/pageSizes.ts        A4等の判定
src/analytics/ga.ts         gtag読み込み。未設定ならno-op
src/analytics/events.ts     匿名イベント。filename等は除去
src/pages/HomePage.tsx      メイン画面
src/pages/PrivacyPage.tsx   プライバシー
src/pages/NotFoundPage.tsx  不明URL（/admin含む）
src/ui/                     ドロップゾーン、結果、ヘッダー
public/_headers             セキュリティヘッダー（Cloudflare Pages）
public/_redirects           SPAフォールバック
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

初期版から外したもの（誤判定しやすい、またはブラウザだけでは不十分）:

- フォント埋め込み
- 画像解像度
- OCR / 文字化け
- 印刷用トンボ・塗り足し
- 色空間
- 中身の文章チェック

## 判定基準

総合結果:

1. エラーが1件でもあれば総合エラー
2. エラーが無く、注意が1件以上なら総合注意
3. それ以外は総合OK

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

イベント:

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

数字の確認場所: https://analytics.google.com/

未設定時に必要なもの:

1. Google アカウント
2. GA4 プロパティ作成
3. 測定ID `G-XXXXXXXXXX`
4. GitHub Secrets の `VITE_GA_MEASUREMENT_ID` と、必要なら Cloudflare Pages 側の同名変数
5. 再デプロイ（GitHub Actions または wrangler）

開発段階では測定IDを入れておらず、実データは送らない・表示しない。

## 管理者画面 / アクセス制限

優先順位どおり、セキュリティと0円運用を、独自UIより上に置いた。

### 結論

独自の `/admin` ダッシュボードは実装していない。  
管理者画面は Google Analytics 公式ダッシュボードを使う。

これは「管理画面のUIが未完成」ではない。  
「実データを独自画面に出すと、秘密鍵か公開APIが必要になり、この段階の制約と安全要件を同時に満たせない」ための意図的な選択。

### HANDOFF必須項目

- 管理者画面のURL: https://analytics.google.com/ （このWebアプリの `/admin` ではない）
- 採用した認証・アクセス制御: Google アカウントによる GA4 権限。このアプリ内に管理者ログインは無い
- なぜその方式か: 独自 `/admin` で実データを出すには Google Analytics Data API のサービスアカウント鍵が必要。鍵をフロントや `VITE_` 環境変数に置くのは禁止。鍵を守るサーバー/Workersを足すと、DBなし・0円・単純さの条件が崩れる。公式画面なら、本人のGoogleログインだけで実データを見られ、一般ユーザーには見えない
- 管理者本人のログイン方法: 自分のGoogleアカウントで analytics.google.com を開き、作成したGA4プロパティを見る
- 一般ユーザーが `/admin` にアクセスすると: 他の不明URLと同じ「ページが見つかりません」。Analyticsデータは出ない。ログインフォームも出ない
- Analytics実データの取得元: このアプリのAPIからは取得していない。GA4公式画面のみ
- 秘密情報の管理場所: 現時点で秘密鍵は存在しない。測定IDは公開前提。将来サーバーを足す場合は Cloudflare の暗号化環境変数に置く
- 公開時に手動設定するもの: GA4プロパティ、測定ID、Cloudflareの環境変数、自分以外にGA4権限を渡さないこと
- 今、アクセス制限は有効か:
  - このWebアプリ内の独自管理画面: 存在しない。実データも出さない
  - GA4公式画面: オーナーがGA4を作り、自分のGoogleアカウントだけに権限を付けた時点で有効
  - 開発段階: 測定ID未設定。実データ送信なし、実データ表示なし

将来、どうしても独自 `/admin` が必要なら:

1. Cloudflare Access で `/admin` をメールOTP等で保護する
2. Analytics取得は Workers 側だけがサービスアカウント鍵を持つ
3. ブラウザへ鍵を出さない

初期版ではこれをやらない。

「管理者画面完成」とは言えない。正確には「管理者確認手段はGA4公式画面。独自 `/admin` は意図的に未実装。アクセス制御はGA4側のアカウント権限に委ねる」状態。

## プライバシー

- PDF処理場所: ユーザーのブラウザ。`src/pdf/parsePdf.ts` の PDF.js
- サーバーアップロード: なし
- 外部へ送る情報: GA4を設定した場合のみ、ページ閲覧と上記の匿名イベント
- 送らない情報: PDFバイナリ、本文、画像、ファイル名、ページの中身
- 追加の外部フォントや広告タグは使っていない
- CSP とセキュリティヘッダーは `public/_headers`

## テスト状況

実行日: 2026-08-16

```text
npm run lint   … 成功
npm test       … 成功（7ファイル / 38テスト）
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

実ファイルのパスワード付きPDFを生成するツールがこのマシンに無かったため、本物の暗号化PDFファイルを使った結合テストは未実施。ブラウザで手動確認するのが次点。

## 公開状況

- 現在: Cloudflare Pages で公開済み
- 公開URL: https://pdf-precheck.pages.dev/
- GitHub: https://github.com/harutyama/pdf-precheck
- Cloudflare アカウント: neymar05253453@gmail.com（Pages プロジェクト名 `pdf-precheck`）
- 残作業:
  1. GA4 測定IDを GitHub Secrets `VITE_GA_MEASUREMENT_ID` に入れる（未設定）
  2. GitHub Secrets `CLOUDFLARE_API_TOKEN` を入れて自動デプロイを有効化する（ワークフローは追加済み）
  3. 必要ならカスタムドメインを付ける

## 未実装

- GA4測定IDの設定（コードとワークフローは用意済み）
- Cloudflare APIトークンの GitHub Secrets 登録（自動デプロイ有効化）
- 独自 `/admin`（意図的）
- 課金、アカウント、DB、回数制限
- ユーザー独自チェック条件
- 条件セット保存
- OGP画像
- 実在の暗号化PDFファイルを使う自動テスト
- フォント埋め込み等の高度なプリフライト

## 既知の問題 / 制限

- 超巨大PDFはブラウザメモリに載せる。数十MBは注意表示するが、端末によっては重い
- ページサイズ判定は MediaBox/Viewport ベース。トンボ付き印刷入稿の「仕上がりサイズ」までは見ない
- 一部の特殊なPDFは PDF.js が読めず `corrupt` / `unknown` になる
- 暗号化PDFの自動テストは、例外分類まで。実ファイルは未投入
- GA4はGoogleへ最低限の利用データを送る。PDF内容は送らないが、完全なゼロ通信ではない
- 測定ID未設定の間、利用状況は確認できない
- 一度にチェックできるのは最大10ファイル。上限は `src/config/site.ts` の `maxPdfFiles`

## 将来のPRO版

今は実装しない。足しにくくならないようにした点:

- 判定ロジックは `src/pdf/` に閉じている。UIはレポートを描画するだけ
- チェックは関数の組み合わせ。後から「有効なチェック一覧」を差し替えられる
- 認証・決済・DBのコードはまだ無い。後から足すときは `src/pdf` に混ぜない
- 回数制限が必要になったら、サーバー側の判定を挟み、ブラウザ判定はそのまま使える
- 独自条件セットは `CheckResult` を返す関数を追加する形が自然
- 今の「回数無制限・登録なし」はプロダクト方針であり、解析エンジンとは独立

やってはいけないこと:

- チェック関数の中にログイン状態を埋め込む
- ファイル名やPDFをAnalyticsやサーバーログに出す
- 管理者パスワードをフロントに書く

## 次にやること

優先順位順:

1. GitHub Secrets に `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を入れて自動デプロイを有効化する
2. GA4 測定IDを作り、Secret `VITE_GA_MEASUREMENT_ID` に入れる
3. 必要ならカスタムドメインを付ける
4. 公開後、数日使ってから PRO の要否を判断する

## ChatGPTへの引き継ぎ

今の状態を一文で言うと:

「ブラウザ内だけで動くPDF提出前チェッカーは https://pdf-precheck.pages.dev/ で公開済み。最大10ファイルまで同時チェックできる。GitHub は https://github.com/harutyama/pdf-precheck 。自動デプロイ用 GitHub Actions はあるが、Cloudflare APIトークンの Secret が未設定。Analytics（GA4）も測定ID未設定。管理者画面は独自 `/admin` ではなく GA4 公式ダッシュボード。」

次の指示の出し方の例:

- 「GitHubに上げて」→ コミット確認後、`gh` でリポジトリ作成。ログインが必要ならそこで止める
- 「Cloudflareに公開して」→ ビルド設定を案内し、ダッシュボード操作はオーナーに1ステップずつ説明する
- 「Analyticsを入れて」→ GA4の測定IDをもらい、`.env` ではなくホストの環境変数に入れる。リポジトリにIDをベタ書きしない方がよい
- 「`/admin` を作れ」→ このHANDOFFの方針を維持する。どうしても作るなら Cloudflare Access + サーバー側鍵。フロントだけで作らない
- 「チェック項目を足して」→ `src/pdf/checks/` に純関数を追加し、`evaluate.ts` から呼ぶ。UIは `CheckResult` をそのまま出せる
- 「サービス名を変えて」→ まず `src/config/site.ts`

公開作業に入るときは、初心者向けに1画面1操作で説明する。アカウント作成や支払いを代行しない。
