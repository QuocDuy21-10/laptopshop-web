"use client";

import { Alert, Card, Descriptions, Result, Skeleton, Space, Table, Timeline, type TableProps } from "antd";
import Link from "next/link";
import { ORDER_STATUS_LABEL } from "@/features/orders/labels";
import { errorMessage, isApiError } from "@/lib/api/errors";
import type { AdminOrder } from "@/lib/api/types";
import { formatDate, formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";
import { OrderStatusTag, PaymentStatusTag } from "../StatusTags";
import { Thumb } from "../Thumb/Thumb";
import { useAdminOrder } from "./hooks";
import { OrderStatusActions } from "./OrderStatusActions";

type Item = AdminOrder["items"][number];

const itemColumns: TableProps<Item>["columns"] = [
  { title: "Ảnh", dataIndex: "image", width: 72, render: (_, i) => <Thumb src={i.image} alt={i.name} /> },
  { title: "Sản phẩm", dataIndex: "name" },
  { title: "Đơn giá", dataIndex: "price", align: "right", render: (_, i) => formatVnd(i.price) },
  { title: "Số lượng", dataIndex: "quantity", align: "right" },
  { title: "Thành tiền", key: "total", align: "right", render: (_, i) => formatVnd(i.price * i.quantity) },
];

export function OrderDetail({ id }: { id: number }) {
  const { data: order, isPending, error } = useAdminOrder(id);
  if (isPending) return <Skeleton active />;
  if (!order) {
    return isApiError(error) && error.status === 404 ? (
      <Result status="404" title="Không tìm thấy đơn hàng" extra={<Link href="/admin/orders">Về danh sách</Link>} />
    ) : (
      <Alert type="error" showIcon title={errorMessage(error)} />
    );
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Đơn hàng #{order.id}</h1>
        <Space>
          <OrderStatusTag status={order.status} />
          <PaymentStatusTag status={order.paymentStatus} />
        </Space>
      </div>
      <OrderStatusActions order={order} />
      <Card>
        <Descriptions
          column={{ xs: 1, md: 2 }}
          items={[
            { key: "customer", label: "Khách hàng", children: `${order.user.fullName ?? order.user.username} (${order.user.username})` },
            { key: "created", label: "Ngày đặt", children: formatDate(order.createdAt) },
            { key: "receiver", label: "Người nhận", children: order.receiverName },
            { key: "phone", label: "Số điện thoại", children: order.receiverPhone },
            { key: "address", label: "Địa chỉ", children: order.receiverAddress },
            { key: "method", label: "Phương thức thanh toán", children: order.paymentMethod },
            ...(order.subtotalPrice !== undefined ? [{ key: "subtotal", label: "Tạm tính", children: formatVnd(order.subtotalPrice) }] : []),
            ...(order.productDiscountAmount !== undefined ? [{ key: "productDiscount", label: "Giảm giá sản phẩm", children: formatVnd(order.productDiscountAmount) }] : []),
            ...(order.couponDiscountAmount !== undefined ? [{ key: "couponDiscount", label: "Giảm giá coupon", children: formatVnd(order.couponDiscountAmount) }] : []),
            ...(order.couponCode ? [{ key: "couponCode", label: "Mã coupon", children: order.couponCode }] : []),
            { key: "total", label: "Tổng tiền", children: formatVnd(order.totalPrice) },
          ]}
        />
      </Card>
      <Card title="Sản phẩm" className={styles.panel}>
        <Table rowKey="productId" columns={itemColumns} dataSource={order.items} pagination={false} scroll={{ x: "max-content" }} />
      </Card>
      <Card title="Lịch sử trạng thái" className={styles.panel}>
        {order.history.length === 0 ? (
          <p>Đơn tạo trước khi bật lịch sử trạng thái.</p>
        ) : (
          <Timeline
            items={order.history.map((h, i) => ({
              key: i,
              title: formatDate(h.createdAt),
              content: `${h.fromStatus ? `${ORDER_STATUS_LABEL[h.fromStatus] ?? h.fromStatus} → ` : "Đặt hàng: "}${ORDER_STATUS_LABEL[h.toStatus] ?? h.toStatus}${h.actor ? ` · ${h.actor.name}` : ""}`,
            }))}
          />
        )}
      </Card>
    </>
  );
}
