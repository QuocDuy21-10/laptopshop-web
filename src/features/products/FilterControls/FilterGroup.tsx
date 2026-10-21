import type { ReactNode } from "react";
import styles from "./FilterControls.module.scss";

export function FilterGroup({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className={styles.group} open={open}>
      <summary className={styles.summary}>{title}</summary>
      <fieldset className={styles.fieldset}>
        <legend className={styles.srOnly}>{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}
