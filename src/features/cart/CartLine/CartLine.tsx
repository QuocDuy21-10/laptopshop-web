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

const FALLBACK_PRICE = { AUTOMATIC: "giá khuyến mãi", null: "giá niêm yết" } as const;

function fallbackNote(fallback: NonNullable<CartItem["promotionFallback"]>) {
  const { availableQuantity, reason, appliedPromotionKind } = fallback;
  const price = FALLBACK_PRICE[appliedPromotionKind ?? "null"];
  if (availableQuantity > 0) {
    const limit = reason === "USER_QUOTA" ? "Bạn chỉ được mua" : "Chỉ còn";
    return `${limit} ${availableQuantity} suất Flash Sale. Giảm số lượng xuống ${availableQuantity} để nhận giá Flash Sale, hoặc giữ nguyên để tính theo ${price}.`;
  }
  return reason === "USER_QUOTA"
    ? `Bạn đã dùng hết suất Flash Sale của mình, dòng này được tính theo ${price}.`
    : `Suất Flash Sale đã hết, dòng này được tính theo ${price}.`;
}

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
        <Price value={line.product.salePrice ?? line.product.price} size="sm" />
        {line.promotionFallback && (
          <p className={styles.note} role="status">
            {fallbackNote(line.promotionFallback)}
          </p>
        )}
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
