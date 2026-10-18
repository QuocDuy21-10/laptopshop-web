"use client";

import { CloudOff } from "lucide-react";
import { Container } from "@/components/layout/Container/Container";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import styles from "./status.module.scss";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className={styles.status}>
      <EmptyState
        as="h1"
        icon={<CloudOff size={40} aria-hidden="true" />}
        title="Không tải được trang"
        description="Máy chủ đang gặp sự cố hoặc mất kết nối. Vui lòng thử lại."
        action={<Button onClick={reset}>Thử lại</Button>}
      />
    </Container>
  );
}
