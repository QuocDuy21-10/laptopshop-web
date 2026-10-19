import type { Product } from "@/lib/api/types";
import { formatSpec, SPEC_ROWS } from "../specs";
import styles from "./SpecTable.module.scss";

export function SpecValue({ value }: { value: string | null }) {
  if (value !== null) return value;
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className={styles.srOnly}>Chưa có thông tin</span>
    </>
  );
}

export function SpecTable({ product }: { product: Product }) {
  const rows = SPEC_ROWS.flatMap((row) => {
    const value = formatSpec(row, product[row.key]);
    return value === null ? [] : [{ label: row.label, value }];
  });
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="spec-title" className={styles.section}>
      <h2 id="spec-title" className={styles.title}>
        Thông số kỹ thuật
      </h2>
      <table className={styles.table}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
