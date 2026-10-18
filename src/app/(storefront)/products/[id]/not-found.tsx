import { PackageX } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container/Container";
import { buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import styles from "../../../status.module.scss";

export default function ProductNotFound() {
  return (
    <Container className={styles.status}>
      <EmptyState
        as="h1"
        icon={<PackageX size={40} aria-hidden="true" />}
        title="Không tìm thấy sản phẩm"
        description="Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng."
        action={
          <Link href="/products" className={buttonClassName()}>
            Xem laptop khác
          </Link>
        }
      />
    </Container>
  );
}
