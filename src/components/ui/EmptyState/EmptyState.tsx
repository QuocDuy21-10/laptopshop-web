import type { ReactNode } from "react";
import styles from "./EmptyState.module.scss";

type Props = { icon?: ReactNode; title: string; description?: string; action?: ReactNode };

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className={styles.empty}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
