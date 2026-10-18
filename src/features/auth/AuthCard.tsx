import type { ReactNode } from "react";
import styles from "./AuthCard.module.scss";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <section className={styles.card} aria-labelledby="auth-title">
        <h1 id="auth-title" className={styles.title}>
          {title}
        </h1>
        {children}
        <p className={styles.footer}>{footer}</p>
      </section>
    </div>
  );
}
