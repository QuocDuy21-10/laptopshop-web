"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { AddToCartButton } from "@/features/products/AddToCart/AddToCartButton";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import type { Product } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { formatVnd } from "@/lib/format";
import { SpecValue } from "../SpecTable/SpecTable";
import { bestIndexes, formatSpec, SPEC_ROWS } from "../specs";
import styles from "./CompareTable.module.scss";

type Props = { products: Product[]; onRemove: (id: number) => void };

function Row({ label, cells, best }: { label: string; cells: (string | null)[]; best: Set<number> }) {
  return (
    <tr>
      <th scope="row" className={styles.label}>
        {label}
      </th>
      {cells.map((value, i) => (
        <td key={i} className={cx(styles.cell, best.has(i) && styles.best)}>
          <SpecValue value={value} />
          {best.has(i) && <Badge tone="success">Tốt nhất</Badge>}
        </td>
      ))}
    </tr>
  );
}

export function CompareTable({ products, onRemove }: Props) {
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className={styles.caption}>So sánh {products.length} sản phẩm</caption>
        <thead>
          <tr>
            <td className={styles.corner} />
            {products.map((p) => (
              <th key={p.id} scope="col" className={styles.product}>
                <ProductImage src={p.image} alt={p.name} sizes="200px" />
                <Link href={`/products/${p.id}`} className={styles.name}>
                  {p.name}
                </Link>
                <div className={styles.actions}>
                  <AddToCartButton
                    productId={p.id}
                    productName={p.name}
                    disabled={p.quantity === 0}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Bỏ ${p.name} khỏi so sánh`}
                    onClick={() => onRemove(p.id)}
                  >
                    Bỏ
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row
            label="Giá"
            cells={products.map((p) => formatVnd(p.price))}
            best={bestIndexes(
              products.map((p) => p.price),
              "lower",
            )}
          />
          {SPEC_ROWS.map((row) => {
            const values = products.map((p) => p[row.key]);
            // every row with a direction holds numbers
            const best = row.better
              ? bestIndexes(values as (number | null)[], row.better)
              : new Set<number>();
            return (
              <Row
                key={row.key}
                label={row.label}
                cells={values.map((v) => formatSpec(row, v))}
                best={best}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
