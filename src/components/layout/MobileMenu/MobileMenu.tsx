"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import type { FilterOption } from "@/lib/api/types";
import { SearchForm } from "../SearchForm/SearchForm";
import styles from "./MobileMenu.module.scss";

export function MobileMenu({ targets }: { targets: FilterOption[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      variant="sheet"
      title="Danh mục"
      trigger={
        <button type="button" className={styles.trigger} aria-label="Mở menu">
          <Menu size={22} aria-hidden="true" />
        </button>
      }
    >
      <SearchForm />
      <nav aria-label="Danh mục" className={styles.nav}>
        <Link href="/advisor" onClick={close}>
          Tư vấn chọn laptop
        </Link>
        <Link href="/products" onClick={close}>
          Tất cả laptop
        </Link>
        {targets.map((t) => (
          <Link key={t.value} href={`/products?target=${t.value}`} onClick={close}>
            {t.name}
          </Link>
        ))}
        <Link href="/promotions" onClick={close}>
          Khuyến mãi
        </Link>
        <Link href="/account/warranties" onClick={close}>
          Bảo hành
        </Link>
      </nav>
      <nav aria-label="Tài khoản và mua sắm" className={styles.nav}>
        <Link href="/wishlist" onClick={close}>
          Yêu thích
        </Link>
        <Link href="/compare" onClick={close}>
          So sánh
        </Link>
        <Link href="/account/orders" onClick={close}>
          Đơn hàng của tôi
        </Link>
        <Link href="/account" onClick={close}>
          Tài khoản
        </Link>
      </nav>
    </Dialog>
  );
}
