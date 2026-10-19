"use client";

import { Alert, Table, type TableProps } from "antd";
import Link from "next/link";
import { errorMessage } from "@/lib/api/errors";
import type { AdminOrder } from "@/lib/api/types";
import { formatDate, formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";
import { OrderStatusTag, PaymentStatusTag } from "../StatusTags";
import { ADMIN_PAGE_SIZE } from "../useListParams";
import { type AdminOrderQuery, useAdminOrders } from "./hooks";

const columns: TableProps<AdminOrder>["columns"] = [
  { title: "Mã đơn", dataIndex: "id", render: (_, o) => <Link href={`/admin/orders/${o.id}`}>#{o.id}</Link> },
  { title: "Khách hàng", key: "user", render: (_, o) => o.user.fullName ?? o.user.username },
  { title: "Người nhận", key: "receiver", render: (_, o) => `${o.receiverName} · ${o.receiverPhone}` },
  { title: "Tổng tiền", dataIndex: "totalPrice", align: "right", render: (_, o) => formatVnd(o.totalPrice) },
  { title: "Trạng thái", dataIndex: "status", render: (_, o) => <OrderStatusTag status={o.status} /> },
  { title: "Thanh toán", dataIndex: "paymentStatus", render: (_, o) => <PaymentStatusTag status={o.paymentStatus} /> },
  { title: "Ngày đặt", dataIndex: "createdAt", render: (_, o) => formatDate(o.createdAt) },
];

type Query = Omit<AdminOrderQuery, "pageSize"> & { page: number };

export function OrdersTable({ query, onPage }: { query: Query; onPage: (page: number) => void }) {
  const { data, isFetching, error } = useAdminOrders(query);
  return (
    <>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có đơn hàng" }}
        pagination={{
          current: query.page,
          pageSize: ADMIN_PAGE_SIZE,
          total: data?.meta.total,
          showSizeChanger: false,
          onChange: onPage,
        }}
      />
    </>
  );
}
