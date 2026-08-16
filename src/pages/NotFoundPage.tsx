import { navigate } from "../ui/usePath.ts";

export function NotFoundPage() {
  return (
    <article className="prose">
      <h1>ページが見つかりません</h1>
      <p>指定されたページはありません。</p>
      <button type="button" className="secondary-button" onClick={() => navigate("/")}>
        トップへ戻る
      </button>
    </article>
  );
}
