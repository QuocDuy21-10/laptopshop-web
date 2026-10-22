"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { AddToCartButton } from "@/features/products/AddToCart/AddToCartButton";
import { useRemoveWishlistItem } from "@/features/wishlist/hooks";
import { formatDate, formatVnd } from "@/lib/format";
import type { WishlistItem } from "@/lib/api/types";
import { PriceAlertDialog } from "../PriceAlertDialog/PriceAlertDialog";
import styles from "./WishlistCard.module.scss";

export function WishlistCard({ userId, item }: { userId: number; item: WishlistItem }) {
  const [open, setOpen] = useState(false);
  const remove = useRemoveWishlistItem(userId);
  const { product } = item;
  const livePrice = product.salePrice ?? product.price;
  return (
    <article className={styles.card}>
      <Link href={`/products/${product.id}`} className={styles.imageLink}><img src={product.image ?? "/images/product/placeholder.png"} alt={product.name} /></Link>
      <div className={styles.body}>
        <h2 className={styles.title}><Link href={`/products/${product.id}`}>{product.name}</Link></h2>
        <Price value={livePrice} />
        {product.salePrice !== undefined && product.salePrice < product.price && <p className={styles.oldPrice}>{formatVnd(product.price)}</p>}
        <Badge tone={product.isActive && product.quantity > 0 ? "success" : "error"}>{!product.isActive ? "Ngừng kinh doanh" : product.quantity > 0 ? "Còn hàng" : "Hết hàng"}</Badge>
        {item.lastAlertMode === "TARGET_PRICE" && <p className={styles.alertState}>Đã đạt mục tiêu</p>}
        {item.lastAlertedAt && <p className={styles.meta}>Thông báo gần nhất: {formatDate(item.lastAlertedAt)} ({formatVnd(item.lastAlertedPrice ?? livePrice)})</p>}
        <div className={styles.actions}>
          <AddToCartButton productId={product.id} productName={product.name} disabled={!product.isActive || product.quantity <= 0} />
          <Button variant="secondary" onClick={() => setOpen(true)}>Theo dõi giá</Button>
          <Button variant="ghost" onClick={() => remove.mutate(product.id)} loading={remove.isPending} aria-label={`Xoá ${product.name} khỏi Wishlist`}>Xoá</Button>
        </div>
      </div>
      <PriceAlertDialog userId={userId} item={item} open={open} onOpenChange={setOpen} />
    </article>
  );
}
