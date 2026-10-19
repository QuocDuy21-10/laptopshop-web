import type { ReactNode } from "react";
import { CompareBar } from "@/features/compare/CompareBar/CompareBar";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CompareBar />
    </>
  );
}
