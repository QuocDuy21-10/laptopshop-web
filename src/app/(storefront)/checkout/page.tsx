import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { CheckoutView } from "@/features/checkout/CheckoutView/CheckoutView";
import styles from "../account.module.scss";

export const metadata: Metadata = { title: "Đặt hàng" };

export default function CheckoutPage() {
  return (
    <Container className={styles.page}>
      <h1 className={styles.title}>Đặt hàng</h1>
      <CheckoutView />
    </Container>
  );
}
