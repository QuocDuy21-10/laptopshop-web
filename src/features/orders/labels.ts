import type { BadgeTone } from "@/components/ui/Badge/Badge";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã huỷ",
};

export const orderStatusTone = (status: string): BadgeTone =>
  ({ PENDING: "warning", SHIPPING: "info", COMPLETED: "success", CANCELLED: "error" } as const)[
    status as "PENDING"
  ] ?? "neutral";

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PAYMENT_UNPAID: "Chưa thanh toán",
  PAYMENT_SUCCESS: "Đã thanh toán",
};

export const paymentStatusTone = (status: string): BadgeTone => (status === "PAYMENT_SUCCESS" ? "success" : "neutral");
