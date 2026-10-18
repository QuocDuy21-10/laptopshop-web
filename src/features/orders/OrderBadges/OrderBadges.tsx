import { Badge } from "@/components/ui/Badge/Badge";
import { ORDER_STATUS_LABEL, orderStatusTone, PAYMENT_STATUS_LABEL, paymentStatusTone } from "../labels";

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={orderStatusTone(status)}>{ORDER_STATUS_LABEL[status] ?? status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge tone={paymentStatusTone(status)}>{PAYMENT_STATUS_LABEL[status] ?? status}</Badge>;
}
