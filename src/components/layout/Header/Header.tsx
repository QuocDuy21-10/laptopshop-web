import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { FilterOption } from "@/lib/api/types";
import styles from "./Header.module.scss";
import { TARGET_LABEL, targetName } from "@/features/products/labels";
import { getFilterOptions } from "@/features/products/server";
import { WishlistLink } from "../WishlistLink/WishlistLink";
import { CartLink } from "@/components/layout/CartLink/CartLink";
import { BrandLogo } from "@/components/brand/BrandLogo/BrandLogo";
import { Container } from "@/components/layout/Container/Container";
import { MobileMenu } from "@/components/layout/MobileMenu/MobileMenu";
import { SearchForm } from "@/components/layout/SearchForm/SearchForm";
import { AccountMenu } from "@/components/layout/AccountMenu/AccountMenu";
import { CategoryNav } from "@/components/layout/CategoryNav/CategoryNav";
import { NotificationBell } from "@/features/notifications/NotificationBell/NotificationBell";

const TARGET_KEYS = Object.keys(TARGET_LABEL);

/**
 * Two rows on desktop: brand, search and account actions on top; categories underneath, so long
 * Vietnamese labels never compete with the search field for space. Below 1024px only the top row
 * shows and categories live in the mobile menu.
 */
export async function Header() {
  const apiTargets: FilterOption[] = await getFilterOptions()
    .then((options) => options.targetOptions)
    .catch(() => []);
  const targets = TARGET_KEYS.map((value) => ({ value, name: targetName(apiTargets, value) }));

  return (
    <header className={styles.header}>
      <Container className={styles.main}>
        <div className={styles.start}>
          <MobileMenu targets={targets} />
          <Link href="/" className={styles.brand} aria-label="LaptopShop - Trang chủ">
            <BrandLogo />
          </Link>
        </div>

        <div className={styles.search}>
          <Suspense fallback={null}>
            <SearchForm />
          </Suspense>
        </div>

        <div className={styles.actions}>
          {/* on phones the wishlist stays reachable from the account menu */}
          <span className={styles.wideOnly}>
            <WishlistLink />
          </span>
          <NotificationBell />
          <CartLink />
          <AccountMenu />
        </div>
      </Container>

      <div className={styles.navRow}>
        <Container className={styles.navInner}>
          <Suspense fallback={<div className={styles.navFallback} />}>
            <CategoryNav targets={targets} />
          </Suspense>
          <Link href="/advisor" className={styles.advisorLink} aria-label="Tư vấn chọn laptop">
            <Sparkles size={16} aria-hidden="true" />
            <span>
              Tư vấn<span className={styles.advisorMore}> chọn laptop</span>
            </span>
          </Link>
        </Container>
      </div>
    </header>
  );
}
