import type { Metadata } from "next";
import { OrderList } from "@/features/admin/orders/OrderList";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function AdminOrdersPage() {
  return <OrderList />;
}
