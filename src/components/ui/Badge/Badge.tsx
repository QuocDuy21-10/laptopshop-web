import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Badge.module.scss";

export type BadgeTone = "success" | "warning" | "error" | "info" | "neutral";

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>;
}
