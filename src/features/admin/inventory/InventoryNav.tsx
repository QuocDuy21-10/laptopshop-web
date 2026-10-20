"use client";

import Link from "next/link";
import styles from "./inventory.module.scss";

export function InventoryNav({ active }: { active: "movements" | "receipts" }) {
  return (
    <nav className={styles.nav} aria-label="Quản lý kho">
      <Link
        className={styles.link}
        href="/admin/inventory"
        aria-current={active === "movements" ? "page" : undefined}
      >
        Nhật ký kho
      </Link>
      <Link
        className={styles.link}
        href="/admin/inventory/receipts"
        aria-current={active === "receipts" ? "page" : undefined}
      >
        Phiếu nhập
      </Link>
    </nav>
  );
}
