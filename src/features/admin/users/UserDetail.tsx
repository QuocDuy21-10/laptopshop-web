"use client";

import { Alert, Card, Descriptions, Skeleton } from "antd";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import styles from "../admin.module.scss";
import { OrdersTable } from "../orders/OrdersTable";
import { useAdminUser } from "./hooks";

export function UserDetail({ id }: { id: number }) {
  const { data: user, isPending, error } = useAdminUser(id);
  const [page, setPage] = useState(1);
  if (isPending) return <Skeleton active />;
  if (!user) return <Alert type="error" showIcon title={errorMessage(error)} />;

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{user.fullName ?? user.username}</h1>
      </div>
      <Card>
        <Descriptions
          column={1}
          items={[
            { key: "email", label: "Email", children: user.username },
            { key: "phone", label: "Số điện thoại", children: user.phone ?? "—" },
            { key: "address", label: "Địa chỉ", children: user.address ?? "—" },
            { key: "role", label: "Vai trò", children: user.role },
          ]}
        />
      </Card>
      <Card title="Đơn hàng" className={styles.panel}>
        <OrdersTable query={{ page, userId: id }} onPage={setPage} />
      </Card>
    </>
  );
}
