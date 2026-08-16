import { AppShell } from "./ui/AppShell.tsx";
import { usePath } from "./ui/usePath.ts";
import { HomePage } from "./pages/HomePage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { PrivacyPage } from "./pages/PrivacyPage.tsx";

export default function App() {
  const path = usePath();

  return (
    <AppShell>
      {path === "/" ? <HomePage /> : null}
      {path === "/privacy" ? <PrivacyPage /> : null}
      {path !== "/" && path !== "/privacy" ? <NotFoundPage /> : null}
    </AppShell>
  );
}
