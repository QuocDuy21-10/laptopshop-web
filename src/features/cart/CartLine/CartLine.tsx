"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Price } from "@/components/ui/Price/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper/QuantityStepper";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import { errorMessage } from "@/lib/api/errors";
import type { CartItem } from "@/lib/api/types";
import { useRemoveCartItem, useUpdateCartItem } from "../hooks";
import styles from "./CartLine.module.scss";

export function CartLine({ line }: { line: CartItem }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const error = update.error ?? remove.error;
  const busy = update.isPending || remove.isPending;
  const unavailable = !line.product.isActive;

  return (
    <li className={styles.line} aria-busy={busy || undefined}>
      <div className={styles.image}>
        <ProductImage src={line.product.image} alt={line.product.name} sizes="120px" />
      </div>
      <div className={styles.info}>
        <Link href={`/products/${line.product.id}`} className={styles.name}>
          {line.product.name}
        </Link>
        <Price value={line.product.price} size="sm" />
        {unavailable && <Badge tone="neutral">Ngừng kinh doanh</Badge>}
        {error && (
          <p className={styles.error} role="alert">
            {errorMessage(error)}
          </p>
        )}
      </div>
      <div className={styles.controls}>
        <QuantityStepper
          value={line.quantity}
          max={Math.max(1, Math.min(line.product.quantity, 100))}
          disabled={busy || unavailable}
          onChange={(quantity) => update.mutate({ id: line.id, quantity })}
        />
        <Price value={line.lineTotal} />
        <button
          type="button"
          className={styles.remove}
          aria-label={`Xoá ${line.product.name} khỏi giỏ`}
          disabled={busy}
          onClick={() => remove.mutate(line.id)}
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
