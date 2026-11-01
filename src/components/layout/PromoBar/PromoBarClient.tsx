"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { formatVnd } from "@/lib/format";
import type { PublicPromotion } from "@/lib/api/types";
import { Container } from "@/components/layout/Container/Container";
import styles from "./PromoBar.module.scss";

const STORAGE_KEY = "promo-bar-dismissed";
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const readDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const serverSnapshot = () => null;

export function PromoBarClient({ promotion }: { promotion: PublicPromotion }) {
  const savedId = useSyncExternalStore(subscribe, readDismissed, serverSnapshot);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const id = String(promotion.id);
  if (savedId === id || dismissedId === id) return null;

  const dismiss = () => {
    setDismissedId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Dismiss still works for this page when browser storage is unavailable.
    }
  };

  return (
    <section className={styles.bar} aria-label="Thông báo khuyến mãi">
      <Container className={styles.inner}>
        <p className={styles.message}>
          Nhập mã <strong>{promotion.code}</strong> giảm {promotion.discountKind === "PERCENT"
            ? `${promotion.discountValue}%` : formatVnd(promotion.discountValue)}
          {promotion.minOrderValue > 0 ? ` cho đơn từ ${formatVnd(promotion.minOrderValue)}` : null}
        </p>
        <Link href="/promotions" className={styles.link}>Xem ưu đãi</Link>
        <button type="button" className={styles.close} onClick={dismiss} aria-label="Đóng thông báo khuyến mãi">
          <X size={18} aria-hidden="true" />
        </button>
      </Container>
    </section>
  );
}
