import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { OrderList } from "@/features/orders/OrderList/OrderList";
import styles from "../../account.module.scss";

export const metadata: Metadata = { title: "Đơn hàng của tôi" };

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const n = Math.trunc(Number(page));
  return (
    <Container className={styles.page}>
      <h1 className={styles.title}>Đơn hàng của tôi</h1>
      <OrderList page={n > 0 ? n : 1} />
    </Container>
  );
}
