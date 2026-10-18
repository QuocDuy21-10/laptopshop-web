import { formatVnd } from "@/lib/format";
import { cx } from "@/lib/cx";
import styles from "./Price.module.scss";

export function Price({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  return <span className={cx(styles.price, styles[size])}>{formatVnd(value)}</span>;
}
