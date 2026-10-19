"use client";

import { Alert, Card, Skeleton, Statistic } from "antd";
import Link from "next/link";
import { errorMessage } from "@/lib/api/errors";
import { formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";
import { OrderStatusTag } from "../StatusTags";
import { useDashboard } from "./hooks";

export function Dashboard() {
  const { data, isPending, error } = useDashboard();
  if (isPending) return <Skeleton active />;
  if (!data) return <Alert type="error" showIcon title={errorMessage(error)} />;

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Tổng quan</h1>
      </div>
      <div className={styles.stats}>
        <Card>
          <Statistic title="Người dùng" value={data.userCount} />
        </Card>
        <Card>
          <Statistic title="Sản phẩm" value={data.productCount} />
        </Card>
        <Card>
          <Statistic title="Đơn hàng" value={data.orderCount} />
        </Card>
        <Card>
          <Statistic title="Doanh thu" value={data.revenue} formatter={(v) => formatVnd(Number(v))} />
        </Card>
        <Card>
          <Statistic title="Sắp hết hàng" value={data.lowStockCount} />
          <Link href="/admin/products?stock=low">Xem sản phẩm sắp hết</Link>
        </Card>
      </div>
      <Card title="Đơn theo trạng thái" className={styles.panel}>
        <ul className={styles.statusList}>
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <li key={status}>
              <Link href={`/admin/orders?status=${status}`} className={styles.statusRow}>
                <OrderStatusTag status={status} />
                <span>{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
