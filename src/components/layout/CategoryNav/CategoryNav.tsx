"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cx } from "@/lib/cx";
import styles from "./CategoryNav.module.scss";

type Props = { targets: { value: string; name: string }[] };

/** The category row; the link matching the current URL is marked with aria-current. */
export function CategoryNav({ targets }: Props) {
  const pathname = usePathname();
  const target = useSearchParams()?.get("target") ?? null;
  const onProducts = pathname === "/products";

  const links = [
    { href: "/products", label: "Tất cả laptop", active: onProducts && !target },
    ...targets.map((t) => ({
      href: `/products?target=${t.value}`,
      label: t.name,
      active: onProducts && target === t.value,
    })),
    { href: "/promotions", label: "Khuyến mãi", active: pathname === "/promotions" },
    { href: "/account/warranties", label: "Bảo hành", active: pathname === "/account/warranties" },
  ];

  return (
    <nav className={styles.nav} aria-label="Danh mục chính">
      <ul className={styles.list}>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={cx(styles.link, l.active && styles.active)}
              aria-current={l.active ? "page" : undefined}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
