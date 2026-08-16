import type { ReactNode } from "react";
import { privacyNotice, site } from "../config/site.ts";
import { BrandMark } from "./BrandMark.tsx";
import { navigate } from "./usePath.ts";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <button type="button" className="brand" onClick={() => navigate("/")}>
          <BrandMark size={34} />
          <span>
            <strong>{site.name}</strong>
            <em>提出前の最終確認</em>
          </span>
        </button>
        <p className="header-privacy">{privacyNotice()}</p>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>{privacyNotice()}</p>
        <nav>
          <button type="button" onClick={() => navigate("/")}>
            トップ
          </button>
          <button type="button" onClick={() => navigate("/privacy")}>
            プライバシー
          </button>
        </nav>
      </footer>
    </div>
  );
}
