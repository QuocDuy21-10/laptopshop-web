import Link from "next/link";
import { Container } from "../Container/Container";
import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div>
          <p className={styles.brand}>LaptopShop</p>
          <p className={styles.muted}>Laptop chính hãng. Thanh toán khi nhận hàng.</p>
        </div>
        <nav aria-label="Liên kết chân trang" className={styles.links}>
          <Link href="/products">Sản phẩm</Link>
          <Link href="/account/orders">Đơn hàng của tôi</Link>
        </nav>
      </Container>
    </footer>
  );
}
