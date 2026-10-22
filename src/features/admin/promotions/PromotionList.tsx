"use client";

import { Alert, Button, Space, Table, Tag, type TableColumnsType } from "antd";
import Link from "next/link";
import { errorMessage } from "@/lib/api/errors";
import { stateLabel } from "./labels";
import { type PromotionQuery, useAdminPromotions } from "./hooks";
import type { PromotionSummary } from "@/lib/api/types";

export function PromotionList() {
  const query: PromotionQuery = { page: 1, pageSize: 20 };
  const result = useAdminPromotions(query);
  if (result.error) return <Alert type="error" message={errorMessage(result.error)} />;
  const columns: TableColumnsType<PromotionSummary> = [
    { title: "Tên", render: (_value, row) => <Link href={`/admin/promotions/${row.id}`}>{row.name}</Link> },
    { title: "Loại", dataIndex: "kind" },
    { title: "Mức giảm", render: (_value, row) => row.discountKind === "PERCENT" ? `${row.discountValue}%` : `${row.discountValue.toLocaleString("vi-VN")} ₫` },
    { title: "Trạng thái", render: (_value, row) => <Tag>{stateLabel[row.effectiveState] ?? row.effectiveState}</Tag> },
    { title: "Đã dùng", render: (_value, row) => row.coupon?.usedCount ?? row.redemptionCount },
  ];
  return <>
    <Space style={{ marginBottom: 16 }}><Link href="/admin/promotions/new"><Button type="primary">Tạo khuyến mãi</Button></Link></Space>
    <Table rowKey="id" loading={result.isPending} dataSource={result.data?.data} pagination={false} columns={columns} />
  </>;
}
