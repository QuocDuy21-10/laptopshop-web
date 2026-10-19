"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { Button, buttonClassName } from "@/components/ui/Button/Button";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import { clearCompare, compareHref, removeCompare } from "../store";
import { useCompare } from "../useCompare";
import styles from "./CompareBar.module.scss";

export function CompareBar() {
  const items = useCompare();
  const pathname = usePathname();
  if (items.length === 0 || pathname === "/compare") return null;

  const ready = items.length >= 2;
  const label = `So sánh (${items.length})`;
  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <aside aria-label="So sánh sản phẩm" className={styles.bar}>
        <Container className={styles.inner}>
          <ul role="list" className={styles.items}>
            {items.map((i) => (
              <li key={i.id} className={styles.item}>
                <div className={styles.thumb}>
                  <ProductImage src={i.image} alt="" sizes="48px" />
                </div>
                <span className={styles.name}>{i.name}</span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Bỏ ${i.name} khỏi so sánh`}
                  onClick={() => removeCompare([i.id])}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            {!ready && (
              <p id="compare-hint" className={styles.hint}>
                Chọn thêm ít nhất 1 sản phẩm
              </p>
            )}
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              Xoá tất cả
            </Button>
            {ready ? (
              <Link
                href={compareHref(items.map((i) => i.id))}
                className={buttonClassName({ size: "sm" })}
              >
                {label}
              </Link>
            ) : (
              <Button size="sm" disabled aria-describedby="compare-hint">
                {label}
              </Button>
            )}
          </div>
        </Container>
      </aside>
    </>
  );
}
