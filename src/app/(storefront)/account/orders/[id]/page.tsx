import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { OrderDetail } from "@/features/orders/OrderDetail/OrderDetail";
import styles from "../../../account.module.scss";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { placed }] = await Promise.all([params, searchParams]);
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  return (
    <Container className={styles.page}>
      <OrderDetail id={orderId} placed={placed === "1"} />
    </Container>
  );
}
