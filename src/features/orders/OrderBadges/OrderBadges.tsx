import { Badge } from "@/components/ui/Badge/Badge";
import { ORDER_STATUS_LABEL, orderStatusTone, PAYMENT_STATUS_LABEL, paymentStatusTone } from "../labels";

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={orderStatusTone(status)}>{ORDER_STATUS_LABEL[status] ?? status}</Badge>;
}

// a cancelled order that was never paid has no payment state worth showing ("Chưa thanh toán" next to "Đã huỷ" reads as a debt)
export function PaymentStatusBadge({ status, orderStatus }: { status: string; orderStatus?: string }) {
  if (orderStatus === "CANCELLED" && status !== "PAYMENT_SUCCESS") return null;
  return <Badge tone={paymentStatusTone(status)}>{PAYMENT_STATUS_LABEL[status] ?? status}</Badge>;
}
