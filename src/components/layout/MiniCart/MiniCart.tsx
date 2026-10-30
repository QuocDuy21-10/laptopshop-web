"use client";

import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useCart } from "@/features/cart/hooks";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import styles from "./MiniCart.module.scss";

const MAX_LINES = 4;

/** Body of the cart popover; mounted only while open, so the cart is fetched on demand. */
export function MiniCart({ onNavigate }: { onNavigate: () => void }) {
  const { data: cart, isPending, isError } = useCart();

  if (isPending) return <Skeleton className={styles.skeleton} />;
  if (isError) return <p className={styles.empty}>Không tải được giỏ hàng. Vui lòng thử lại.</p>;
  if (cart.items.length === 0) return <p className={styles.empty}>Giỏ hàng của bạn đang trống.</p>;

  const lines = cart.items.slice(0, MAX_LINES);
  const more = cart.items.length - lines.length;

  return (
    <div className={styles.cart}>
      <ul className={styles.list}>
        {lines.map((line) => (
          <li key={line.id} className={styles.line}>
            <div className={styles.image}>
              <ProductImage src={line.product.image} alt="" sizes="56px" />
            </div>
            <div className={styles.info}>
              <Link href={`/products/${line.product.id}`} className={styles.name} onClick={onNavigate}>
                {line.product.name}
              </Link>
              <span className={styles.meta}>
                {line.quantity} × <Price value={line.product.salePrice ?? line.product.price} size="sm" />
              </span>
            </div>
          </li>
        ))}
      </ul>
      {more > 0 && <p className={styles.more}>và {more} sản phẩm khác</p>}
      <div className={styles.total}>
        <span>Tạm tính</span>
        <Price value={cart.totalAfterProductDiscount ?? cart.subtotal} />
      </div>
      <div className={styles.actions}>
        <Link href="/cart" className={buttonClassName({ variant: "secondary", size: "sm" })} onClick={onNavigate}>
          Xem giỏ hàng
        </Link>
        <Link href="/checkout" className={buttonClassName({ size: "sm" })} onClick={onNavigate}>
          Thanh toán
        </Link>
      </div>
    </div>
  );
}
