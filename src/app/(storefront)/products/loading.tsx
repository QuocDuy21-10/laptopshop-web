import { Container } from "@/components/layout/Container/Container";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import gridStyles from "@/features/products/ProductGrid/ProductGrid.module.scss";
import styles from "./page.module.scss";

export default function Loading() {
  return (
    <Container className={styles.page}>
      <Skeleton className={styles.skeletonTitle} />
      <div className={gridStyles.grid} aria-label="Đang tải sản phẩm" role="status">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </Container>
  );
}
