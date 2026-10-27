import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/layout/AccountMenu/AccountMenu";
import { CartLink } from "@/components/layout/CartLink/CartLink";
import { Container } from "@/components/layout/Container/Container";
import { MobileMenu } from "@/components/layout/MobileMenu/MobileMenu";
import { SearchForm } from "@/components/layout/SearchForm/SearchForm";
import { NotificationBell } from "@/features/notifications/NotificationBell/NotificationBell";
import { TARGET_LABEL, targetName } from "@/features/products/labels";
import { getFilterOptions } from "@/features/products/server";
import type { FilterOption } from "@/lib/api/types";
import { WishlistLink } from "../WishlistLink/WishlistLink";
import styles from "./Header.module.scss";

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
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            </span>
            <span className={styles.brandText}>LaptopShop</span>
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
          <nav className={styles.nav} aria-label="Danh mục chính">
            <ul className={styles.navList}>
              <li>
                <Link href="/products" className={styles.navLink}>
                  Tất cả laptop
                </Link>
              </li>
              {targets.map((t) => (
                <li key={t.value}>
                  <Link href={`/products?target=${t.value}`} className={styles.navLink}>
                    {t.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/promotions" className={styles.navLink}>
                  Khuyến mãi
                </Link>
              </li>
            </ul>
          </nav>
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
