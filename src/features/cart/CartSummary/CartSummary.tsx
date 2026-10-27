import type { ReactNode } from "react";
import { Price } from "@/components/ui/Price/Price";
import type { Cart } from "@/lib/api/types";
import styles from "./CartSummary.module.scss";

export type SummaryPricing = {
  productDiscount: number;
  couponDiscount: number;
  total: number;
};

export function CartSummary({
  cart,
  action,
  title = "Tóm tắt đơn hàng",
  pricing = {
    productDiscount: cart.productDiscount ?? 0,
    couponDiscount: 0,
    total: cart.totalAfterProductDiscount ?? cart.subtotal,
  },
}: {
  cart: Cart;
  action?: ReactNode;
  title?: string;
  pricing?: SummaryPricing;
}) {
  return (
    <section className={styles.summary} aria-labelledby="summary-title">
      <h2 id="summary-title" className={styles.title}>
        {title}
      </h2>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Số lượng</dt>
          <dd>{cart.itemCount} sản phẩm</dd>
        </div>
        <div className={styles.row}>
          <dt>Thanh toán</dt>
          <dd>Khi nhận hàng (COD)</dd>
        </div>
        {pricing.productDiscount > 0 && (
          <div className={styles.row}>
            <dt>Ưu đãi sản phẩm</dt>
            <dd>-<Price value={pricing.productDiscount} size="sm" /></dd>
          </div>
        )}
        {pricing.couponDiscount > 0 && (
          <div className={styles.row}>
            <dt>Giảm giá mã ưu đãi</dt>
            <dd>-<Price value={pricing.couponDiscount} size="sm" /></dd>
          </div>
        )}
        <div className={styles.total}>
          <dt>Tổng cộng</dt>
          <dd>
            <Price value={pricing.total} size="lg" />
          </dd>
        </div>
      </dl>
      {action}
    </section>
  );
}
