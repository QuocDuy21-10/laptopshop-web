"use client";

import { Button, Result, Spin } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMe } from "@/features/account/useMe";
import styles from "./admin.module.scss";

// UX only: the API answers 403 to non-admins, which is the real boundary
export function AdminGuard({ children }: { children: ReactNode }) {
  const { data: me, isPending, isError, refetch } = useMe();
  if (isPending) {
    return (
      <div className={styles.center}>
        <Spin size="large" />
      </div>
    );
  }
  if (isError) {
    return (
      <Result
        status="error"
        title="Không tải được phiên đăng nhập"
        extra={<Button onClick={() => refetch()}>Thử lại</Button>}
      />
    );
  }
  if (me?.role !== "ADMIN") {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang quản trị."
        extra={<Link href="/">Về trang chủ</Link>}
      />
    );
  }
  return children;
}
