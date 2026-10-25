import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/layout/AccountMenu/AccountMenu";
import { CartLink } from "@/components/layout/CartLink/CartLink";
import { Container } from "@/components/layout/Container/Container";
import { MobileMenu } from "@/components/layout/MobileMenu/MobileMenu";
import { SearchForm } from "@/components/layout/SearchForm/SearchForm";
import { getFilterOptions } from "@/features/products/server";
import type { FilterOption } from "@/lib/api/types";
import { WishlistLink } from "../WishlistLink/WishlistLink";
import { NotificationBell } from "@/features/notifications/NotificationBell/NotificationBell";
import styles from "./Header.module.scss";

const TARGET_LINKS = [
  { href: "/products?target=GAMING", label: "Gaming" },
  { href: "/products?target=SINHVIEN_VANPHONG", label: "Sinh viên - Văn phòng" },
  { href: "/products?target=THIET_KE_DO_HOA", label: "Thiết kế đồ họa" },
  { href: "/products?target=MONG_NHE", label: "Mỏng nhẹ" },
] as const;

export async function Header() {
  const targets: FilterOption[] = await getFilterOptions()
    .then((options) => options.targetOptions)
    .catch(() => []);

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <div className={styles.left}>
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
            <span>LaptopShop</span>
          </Link>

          <nav className={styles.nav} aria-label="Danh mục chính">
            <Link href="/advisor" className={styles.advisorLink}>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Tư vấn chọn laptop</span>
            </Link>
            <Link href="/promotions" className={styles.navLink}>Khuyến mãi</Link>

            <span className={styles.navDivider} aria-hidden />

            {TARGET_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.right}>
          <div className={styles.searchWrap}>
            <Suspense fallback={null}>
              <SearchForm />
            </Suspense>
          </div>
          <div className={styles.actions}>
            <WishlistLink />
            <NotificationBell />
            <CartLink />
            <AccountMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
