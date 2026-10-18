import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { CartView } from "@/features/cart/CartView/CartView";
import styles from "../account.module.scss";

export const metadata: Metadata = { title: "Giỏ hàng" };

export default function CartPage() {
  return (
    <Container className={styles.page}>
      <h1 className={styles.title}>Giỏ hàng</h1>
      <CartView />
    </Container>
  );
}
