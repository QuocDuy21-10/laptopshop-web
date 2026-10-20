import type { ReactNode } from "react";
import styles from "./EmptyState.module.scss";

// standalone pages (404, error) pass as="h1" so the page keeps a top-level heading
type Props = { icon?: ReactNode; title: string; description?: string; action?: ReactNode; as?: "h1" | "h2" | "p" };

export function EmptyState({ icon, title, description, action, as: Heading = "h2" }: Props) {
  return (
    <div className={styles.empty}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
