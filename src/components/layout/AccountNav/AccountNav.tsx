"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { cx } from "@/lib/cx";
import styles from "./AccountNav.module.scss";

const LINKS = [
  { href: "/account", label: "Hồ sơ", exact: true },
  { href: "/account/orders", label: "Đơn hàng" },
  { href: "/account/warranties", label: "Bảo hành" },
  { href: "/account/after-sales", label: "Hậu mãi" },
  { href: "/account/notifications", label: "Thông báo" },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  return (
    <Container className={styles.wrap}>
      <nav aria-label="Tài khoản" className={styles.nav}>
        <ul className={styles.list}>
          {LINKS.map((link) => {
            const active = "exact" in link ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link href={link.href} className={cx(styles.link, active && styles.active)} aria-current={active ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </Container>
  );
}
