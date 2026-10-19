import type { OrderStatus } from "@/lib/api/types";

export const ORDER_STATUSES = ["PENDING", "SHIPPING", "COMPLETED", "CANCELLED"] as const satisfies readonly OrderStatus[];

// mirrors TRANSITIONS in laptopshop-api src/modules/orders/order-status.ts
export const NEXT_STATUS: Record<OrderStatus, { to: OrderStatus; label: string; danger?: boolean }[]> = {
  PENDING: [
    { to: "SHIPPING", label: "Giao hàng" },
    { to: "CANCELLED", label: "Huỷ đơn", danger: true },
  ],
  SHIPPING: [
    { to: "COMPLETED", label: "Hoàn thành" },
    { to: "CANCELLED", label: "Huỷ đơn", danger: true },
  ],
  COMPLETED: [],
  CANCELLED: [],
};
