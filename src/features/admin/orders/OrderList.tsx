"use client";

import { Alert, Segmented, Table, type TableProps } from "antd";
import Link from "next/link";
import { ORDER_STATUS_LABEL } from "@/features/orders/labels";
import { errorMessage } from "@/lib/api/errors";
import type { AdminOrder } from "@/lib/api/types";
import { formatDate, formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";
import { OrderStatusTag, PaymentStatusTag } from "../StatusTags";
import { ADMIN_PAGE_SIZE, useListParams } from "../useListParams";
import { useAdminOrders } from "./hooks";
import { ORDER_STATUSES } from "./transitions";

const FILTER_OPTIONS = [{ value: "", label: "Tất cả" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))];

const columns: TableProps<AdminOrder>["columns"] = [
  { title: "Mã đơn", dataIndex: "id", render: (_, o) => <Link href={`/admin/orders/${o.id}`}>#{o.id}</Link> },
  { title: "Khách hàng", key: "user", render: (_, o) => o.user.fullName ?? o.user.username },
  { title: "Người nhận", key: "receiver", render: (_, o) => `${o.receiverName} · ${o.receiverPhone}` },
  { title: "Tổng tiền", dataIndex: "totalPrice", align: "right", render: (_, o) => formatVnd(o.totalPrice) },
  { title: "Trạng thái", dataIndex: "status", render: (_, o) => <OrderStatusTag status={o.status} /> },
  { title: "Thanh toán", dataIndex: "paymentStatus", render: (_, o) => <PaymentStatusTag status={o.paymentStatus} /> },
  { title: "Ngày đặt", dataIndex: "createdAt", render: (_, o) => formatDate(o.createdAt) },
];

export function OrderList() {
  const { get, page, set } = useListParams();
  const raw = get("status");
  const status = ORDER_STATUSES.find((s) => s === raw);
  const { data, isFetching, error } = useAdminOrders({ page, status });

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Đơn hàng</h1>
      </div>
      <div className={styles.filters}>
        <Segmented options={FILTER_OPTIONS} value={status ?? ""} onChange={(v) => set({ status: String(v) })} />
      </div>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có đơn hàng" }}
        pagination={{
          current: page,
          pageSize: ADMIN_PAGE_SIZE,
          total: data?.meta.total,
          showSizeChanger: false,
          onChange: (p) => set({ page: p }),
        }}
      />
    </>
  );
}
