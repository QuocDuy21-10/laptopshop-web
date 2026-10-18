import type { ReactNode } from "react";
import { Price } from "@/components/ui/Price/Price";
import type { Cart } from "@/lib/api/types";
import styles from "./CartSummary.module.scss";

export function CartSummary({ cart, action, title = "Tóm tắt đơn hàng" }: { cart: Cart; action?: ReactNode; title?: string }) {
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
        <div className={styles.total}>
          <dt>Tổng cộng</dt>
          <dd>
            <Price value={cart.subtotal} size="lg" />
          </dd>
        </div>
      </dl>
      {action}
    </section>
  );
}
