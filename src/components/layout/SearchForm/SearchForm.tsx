import { Search } from "lucide-react";

import { cx } from "@/lib/cx";
import styles from "./SearchForm.module.scss";

export function SearchForm({ className, defaultValue }: { className?: string; defaultValue?: string }) {
  return (
    <form action="/products" method="get" role="search" className={cx(styles.form, className)}>
      <label htmlFor="site-search" className={styles.label}>
        Tìm laptop
      </label>
      <Search size={18} aria-hidden="true" className={styles.icon} />
      <input
        id="site-search"
        name="q"
        type="search"
        maxLength={100}
        defaultValue={defaultValue}
        placeholder="Tìm theo tên laptop…"
        className={styles.input}
      />
    </form>
  );
}
