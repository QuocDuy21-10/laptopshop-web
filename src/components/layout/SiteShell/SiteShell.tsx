import type { ReactNode } from "react";
import { CompareBar } from "@/features/compare/CompareBar/CompareBar";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { PendingWishlistIntent } from "@/features/wishlist/PendingWishlistIntent/PendingWishlistIntent";
import styles from "./SiteShell.module.scss";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <main id="main" className={styles.main}>
        <PendingWishlistIntent />
        {children}
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}
