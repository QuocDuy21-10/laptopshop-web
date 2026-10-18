"use client";

import { PackageX } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert/Alert";
import { buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Price } from "@/components/ui/Price/Price";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { CancelOrderDialog } from "../CancelOrderDialog/CancelOrderDialog";
import { useOrder } from "../hooks";
import { OrderStatusBadge, PaymentStatusBadge } from "../OrderBadges/OrderBadges";
import styles from "./OrderDetail.module.scss";

export function OrderDetail({ id, placed }: { id: number; placed: boolean }) {
  const order = useOrder(id);

  if (order.isPending) return <Skeleton className={styles.skeleton} />;
  if (order.isError) {
    if (isApiError(order.error) && order.error.status === 404) {
      return (
        <EmptyState
          icon={<PackageX size={40} aria-hidden="true" />}
          title="Không tìm thấy đơn hàng"
          action={
            <Link href="/account/orders" className={buttonClassName({ variant: "secondary" })}>
              Xem đơn hàng của tôi
            </Link>
          }
        />
      );
    }
    return <Alert tone="error" title={errorMessage(order.error)} />;
  }

  const o = order.data;
  return (
    <div className={styles.detail}>
      {placed && <Alert tone="success" title="Đặt hàng thành công. Cảm ơn bạn đã mua sắm tại LaptopShop!" />}
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Đơn #{o.id}</h1>
          <p className={styles.meta}>Đặt lúc {formatDate(o.createdAt)}</p>
        </div>
        <div className={styles.badges}>
          <OrderStatusBadge status={o.status} />
          <PaymentStatusBadge status={o.paymentStatus} />
        </div>
      </header>

      <section className={styles.card} aria-labelledby="items-title">
        <h2 id="items-title" className={styles.cardTitle}>
          Sản phẩm
        </h2>
        <ul role="list" className={styles.items}>
          {o.items.map((item) => (
            <li key={item.productId} className={styles.item}>
              <Link href={`/products/${item.productId}`}>{item.name}</Link>
              <span className={styles.qty}>
                <Price value={item.price} size="sm" /> × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.total}>
          <span>Tổng cộng</span>
          <Price value={o.totalPrice} size="lg" />
        </div>
      </section>

      <section className={styles.card} aria-labelledby="receiver-title">
        <h2 id="receiver-title" className={styles.cardTitle}>
          Người nhận
        </h2>
        <p>{o.receiverName}</p>
        <p>{o.receiverPhone}</p>
        <p>{o.receiverAddress}</p>
        <p className={styles.meta}>Thanh toán khi nhận hàng (COD)</p>
      </section>

      {o.status === "PENDING" && (
        <div className={styles.actions}>
          <CancelOrderDialog orderId={o.id} />
        </div>
      )}
    </div>
  );
}
