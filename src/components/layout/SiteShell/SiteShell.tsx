import type { ReactNode } from "react";
import { CompareBar } from "@/features/compare/CompareBar/CompareBar";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { PendingWishlistIntent } from "@/features/wishlist/PendingWishlistIntent/PendingWishlistIntent";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <PendingWishlistIntent />
      <main id="main">{children}</main>
      <Footer />
      <CompareBar />
    </>
  );
}
