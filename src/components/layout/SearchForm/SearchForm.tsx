import { Search } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./SearchForm.module.scss";

type Props = { className?: string; defaultValue?: string; id?: string; autoFocus?: boolean };

export function SearchForm({ className, defaultValue, id = "site-search", autoFocus }: Props) {
  return (
    <form action="/products" method="get" role="search" className={cx(styles.form, className)}>
      <label htmlFor={id} className={styles.label}>
        Tìm laptop
      </label>
      <Search size={18} aria-hidden="true" className={styles.icon} />
      <input
        id={id}
        name="q"
        type="search"
        maxLength={100}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Tìm theo tên laptop…"
        className={styles.input}
      />
    </form>
  );
}
