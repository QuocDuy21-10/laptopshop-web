import { Tag } from "antd";
import type { BadgeTone } from "@/components/ui/Badge/Badge";
import { ORDER_STATUS_LABEL, orderStatusTone, PAYMENT_STATUS_LABEL, paymentStatusTone } from "@/features/orders/labels";

// same tones as the storefront badges, in antd's preset tag colours
const TAG_COLOR: Record<BadgeTone, string> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "processing",
  neutral: "default",
};

export const OrderStatusTag = ({ status }: { status: string }) => (
  <Tag color={TAG_COLOR[orderStatusTone(status)]}>{ORDER_STATUS_LABEL[status] ?? status}</Tag>
);

export const PaymentStatusTag = ({ status }: { status: string }) => (
  <Tag color={TAG_COLOR[paymentStatusTone(status)]}>{PAYMENT_STATUS_LABEL[status] ?? status}</Tag>
);
