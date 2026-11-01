"use client";

import { useRef, type ReactNode } from "react";

import { cx } from "@/lib/cx";
import { useHeaderCollapse } from "./useHeaderCollapse";
import styles from "./Header.module.scss";

export function HeaderFrame({
  mainRow,
  navigationRow,
}: {
  mainRow: ReactNode;
  navigationRow: ReactNode;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const collapsed = useHeaderCollapse(headerRef);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.mainRow}>{mainRow}</div>
      <div className={cx(styles.navRow, collapsed && styles.collapsed)} inert={collapsed}>
        {navigationRow}
      </div>
    </header>
  );
}
