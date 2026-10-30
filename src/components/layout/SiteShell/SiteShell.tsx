import type { ReactNode } from "react";

import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import styles from "./SiteShell.module.scss";
import { CompareBar } from "@/features/compare/CompareBar/CompareBar";
import { PendingCartIntent } from "@/features/cart/PendingCartIntent/PendingCartIntent";
import { PendingWishlistIntent } from "@/features/wishlist/PendingWishlistIntent/PendingWishlistIntent";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <main id="main" className={styles.main}>
        <PendingWishlistIntent />
        <PendingCartIntent />
        {children}
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}
