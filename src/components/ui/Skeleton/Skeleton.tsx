import { cx } from "@/lib/cx";
import styles from "./Skeleton.module.scss";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx(styles.skeleton, className)} />;
}
