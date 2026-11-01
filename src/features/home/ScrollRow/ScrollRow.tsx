"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./ScrollRow.module.scss";

const STEP = 0.9;

export function ScrollRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy?.({ left: direction * el.clientWidth * STEP, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <div className={cx(styles.row, className)}>
      <button type="button" className={cx(styles.nav, styles.prev)} aria-label={`Cuộn ${label} sang trái`} onClick={() => scroll(-1)}>
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <ul ref={track} role="list" aria-label={label} className={styles.track}>
        {children}
      </ul>
      <button type="button" className={cx(styles.nav, styles.next)} aria-label={`Cuộn ${label} sang phải`} onClick={() => scroll(1)}>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
