import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/features/admin/orders/OrderDetail";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <OrderDetail id={id} />;
}
