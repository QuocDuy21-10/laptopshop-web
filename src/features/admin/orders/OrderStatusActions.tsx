"use client";

import { App, Button, Popconfirm, Space } from "antd";
import { ORDER_STATUS_LABEL } from "@/features/orders/labels";
import { errorMessage } from "@/lib/api/errors";
import type { AdminOrder, OrderStatus } from "@/lib/api/types";
import styles from "../admin.module.scss";
import { useChangeOrderStatus } from "./hooks";
import { NEXT_STATUS } from "./transitions";

export function OrderStatusActions({ order }: { order: AdminOrder }) {
  const { message } = App.useApp();
  const change = useChangeOrderStatus(order.id);
  const actions = NEXT_STATUS[order.status];
  if (actions.length === 0) return null;

  const run = (to: OrderStatus) =>
    change.mutateAsync(to).then(
      () => message.success(`Đã chuyển sang "${ORDER_STATUS_LABEL[to]}"`),
      (e) => message.error(errorMessage(e)),
    );

  return (
    <Space wrap className={styles.actions}>
      {actions.map((a) =>
        a.danger ? (
          <Popconfirm
            key={a.to}
            title="Huỷ đơn hàng này?"
            description="Sản phẩm sẽ được hoàn lại kho."
            okText="Xác nhận huỷ"
            cancelText="Không"
            okButtonProps={{ danger: true }}
            onConfirm={() => run(a.to)}
          >
            <Button danger disabled={change.isPending}>
              {a.label}
            </Button>
          </Popconfirm>
        ) : (
          <Button key={a.to} type="primary" loading={change.isPending && change.variables === a.to} onClick={() => run(a.to)}>
            {a.label}
          </Button>
        ),
      )}
    </Space>
  );
}
