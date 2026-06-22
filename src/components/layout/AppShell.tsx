import type { ReactNode } from "react";
import { AppNav } from "./AppNav";
import { AppFooter } from "./AppFooter";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <AppNav />
      <main className="page-content" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <AppFooter />
    </>
  );
}
