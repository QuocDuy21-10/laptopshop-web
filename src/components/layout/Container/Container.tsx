import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Container.module.scss";

type Props = { as?: "div" | "section" | "main"; className?: string; children: ReactNode; id?: string };

export function Container({ as: Tag = "div", className, children, id }: Props) {
  return (
    <Tag id={id} className={cx(styles.container, className)}>
      {children}
    </Tag>
  );
}
