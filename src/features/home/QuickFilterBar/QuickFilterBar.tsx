import type { FC } from "react";
import Link from "next/link";
import styles from "./QuickFilterBar.module.scss";

export interface BudgetShortcut {
  label: string;
  href: string;
}

export const DEFAULT_BUDGET_SHORTCUTS: BudgetShortcut[] = [
  { label: "Dưới 15 triệu", href: "/products?maxPrice=15000000" },
  { label: "15 – 20 triệu", href: "/products?minPrice=15000000&maxPrice=20000000" },
  { label: "20 – 30 triệu", href: "/products?minPrice=20000000&maxPrice=30000000" },
  { label: "Trên 30 triệu", href: "/products?minPrice=30000000" },
];

interface QuickFilterBarProps {
  shortcuts?: BudgetShortcut[];
  advisorHref?: string;
}

export const QuickFilterBar: FC<QuickFilterBarProps> = ({
  shortcuts = DEFAULT_BUDGET_SHORTCUTS,
  advisorHref = "/advisor",
}) => {
  return (
    <section className={styles.filterWrap} aria-label="Tìm nhanh theo ngân sách">
      <div className={styles.filterCard}>
        <div className={styles.labelGroup}>
          <span className={styles.labelDot} aria-hidden />
          <span>Chọn nhanh theo giá:</span>
        </div>

        <div className={styles.chipsList}>
          {shortcuts.map((item) => (
            <Link key={item.label} href={item.href} className={styles.chip}>
              {item.label}
            </Link>
          ))}
        </div>

        <Link href={advisorHref} className={styles.advisorLink}>
          <span>Tư vấn cấu hình chi tiết</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
};
