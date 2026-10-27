import type { ReactNode } from "react";
import styles from "./PageHeader.module.scss";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  /** Page-level actions (primary CTA last); they wrap under the title on small screens. */
  actions?: ReactNode;
  /** Small line above the title, e.g. breadcrumbs or an order code. */
  eyebrow?: ReactNode;
  titleId?: string;
};

/** The one `h1` of a storefront page, with optional description and actions. */
export function PageHeader({ title, description, actions, eyebrow, titleId }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
        <h1 id={titleId} className={styles.title}>
          {title}
        </h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
