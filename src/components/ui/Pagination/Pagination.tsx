import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import styles from "./Pagination.module.scss";

type Props = { page: number; totalPages: number; hrefFor: (page: number) => string };

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  return (
    <nav aria-label="Phân trang" className={styles.pagination}>
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={styles.item} aria-label="Trang trước">
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={cx(styles.item, p === page && styles.current)}
          aria-label={`Trang ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={styles.item} aria-label="Trang sau">
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
