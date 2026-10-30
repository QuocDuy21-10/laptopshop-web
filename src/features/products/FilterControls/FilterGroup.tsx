"use client";

import { useState, type ReactNode } from "react";
import styles from "./FilterControls.module.scss";

const VISIBLE_ROWS = 5;

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

/** Shows the first rows plus any selected one; the rest sit behind "Xem thêm". */
export function ExpandableRows({ rows }: { rows: { node: ReactNode; selected: boolean }[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.filter((row, i) => i < VISIBLE_ROWS || row.selected);
  const hidden = rows.length - visible.length;
  return (
    <>
      {visible.map((row) => row.node)}
      {(hidden > 0 || expanded) && rows.length > VISIBLE_ROWS && (
        <button type="button" className={styles.more} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Thu gọn" : `Xem thêm ${hidden}`}
        </button>
      )}
    </>
  );
}
