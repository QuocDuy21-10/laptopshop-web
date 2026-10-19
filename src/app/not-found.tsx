import { Compass } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell/SiteShell";
import { Container } from "@/components/layout/Container/Container";
import { buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import styles from "./status.module.scss";

export default function NotFound() {
  return (
    <SiteShell>
      <Container className={styles.status}>
        <EmptyState
          as="h1"
          icon={<Compass size={40} aria-hidden="true" />}
          title="Không tìm thấy trang"
          description="Đường dẫn không tồn tại hoặc đã được thay đổi."
          action={
            <Link href="/" className={buttonClassName()}>
              Về trang chủ
            </Link>
          }
        />
      </Container>
    </SiteShell>
  );
}
