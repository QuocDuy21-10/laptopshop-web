import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./HomeSection.module.scss";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
  className?: string;
  children: ReactNode;
};

export function HomeSection({ id, title, subtitle, link, className, children }: Props) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className={cx(styles.section, className)}>
      <div className={styles.header}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {link && (
          <Link href={link.href} className={styles.link}>
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
