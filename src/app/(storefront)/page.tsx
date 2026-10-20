import { Laptop } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container/Container";
import { buttonClassName } from "@/components/ui/Button/Button";
import { ProductGrid } from "@/features/products/ProductGrid/ProductGrid";
import { getFilterOptions, listProducts } from "@/features/products/server";
import styles from "./page.module.scss";

export default async function HomePage() {
  const [options, products] = await Promise.all([getFilterOptions(), listProducts({ page: 1, pageSize: 8 })]);

  return (
    <Container className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div>
          <p className={styles.eyebrow}>Chính hãng · Thanh toán khi nhận hàng</p>
          <h1 id="hero-title" className={styles.heroTitle}>
            Chọn đúng laptop cho công việc và giải trí
          </h1>
          <p className={styles.lead}>So sánh theo hãng, nhu cầu và khoảng giá. Giá hiển thị là giá bán hiện tại.</p>
          <div className={styles.heroActions}>
            <Link href="/products" className={buttonClassName({ size: "lg" })}>
              Xem tất cả laptop
            </Link>
            <Link href="/advisor" className={buttonClassName({ variant: "secondary", size: "lg" })}>
              Tư vấn chọn laptop
            </Link>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <Laptop size={96} strokeWidth={1.25} />
        </div>
      </section>

      <section aria-labelledby="needs-title" className={styles.section}>
        <h2 id="needs-title" className={styles.sectionTitle}>
          Theo nhu cầu
        </h2>
        <ul role="list" className={styles.needs}>
          {options.targetOptions.map((t) => (
            <li key={t.value}>
              <Link href={`/products?target=${t.value}`} className={styles.need}>
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="selling-title" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 id="selling-title" className={styles.sectionTitle}>
            Laptop đang bán
          </h2>
          <Link href="/products">Xem tất cả</Link>
        </div>
        <ProductGrid products={products.data} options={options} />
      </section>
    </Container>
  );
}
