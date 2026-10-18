import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Alert.module.scss";

type Tone = "error" | "success" | "warning" | "info";
const icons = { error: CircleAlert, success: CircleCheck, warning: TriangleAlert, info: Info };

export function Alert({ tone, title, children }: { tone: Tone; title?: string; children?: ReactNode }) {
  const Icon = icons[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx(styles.alert, styles[tone])}>
      <Icon size={20} aria-hidden="true" className={styles.icon} />
      <div>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );
}
