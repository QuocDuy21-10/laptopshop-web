"use client";

import { Package } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert/Alert";
import { buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Price } from "@/components/ui/Price/Price";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { useOrders } from "../hooks";
import { OrderStatusBadge, PaymentStatusBadge } from "../OrderBadges/OrderBadges";
import styles from "./OrderList.module.scss";

export function OrderList({ page }: { page: number }) {
  const orders = useOrders(page);

  if (orders.isPending) return <Skeleton className={styles.skeleton} />;
  if (orders.isError) return <Alert tone="error" title={errorMessage(orders.error)} />;
  if (orders.data.data.length === 0) {
    return (
      <EmptyState
        icon={<Package size={40} aria-hidden="true" />}
        title="Bạn chưa có đơn hàng nào"
        action={
          <Link href="/products" className={buttonClassName()}>
            Mua sắm ngay
          </Link>
        }
      />
    );
  }

  return (
    <>
      <ul role="list" className={styles.list}>
        {orders.data.data.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${order.id}`} className={styles.row}>
              <div>
                <p className={styles.id}>Đơn #{order.id}</p>
                <p className={styles.meta}>
                  {formatDate(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} sản phẩm
                </p>
              </div>
              <div className={styles.badges}>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} orderStatus={order.status} />
              </div>
              <Price value={order.totalPrice} />
            </Link>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={orders.data.meta.totalPages} hrefFor={(p) => `/account/orders?page=${p}`} />
    </>
  );
}
