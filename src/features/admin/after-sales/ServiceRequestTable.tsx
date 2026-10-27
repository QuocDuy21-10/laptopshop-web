"use client";

import { Table } from "antd";
import Link from "next/link";
import { AFTER_SALES_STATUS_LABEL, AFTER_SALES_TYPE_LABEL } from "@/features/after-sales/labels";
import { labelOf } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export function ServiceRequestTable({ rows, loading }: { rows: Array<{ id: number; code: string; subject: string; type: string; status: string; createdAt: string }>; loading?: boolean }) {
  return <Table rowKey="id" loading={loading} dataSource={rows} pagination={false} columns={[{ title: "Mã phiếu", dataIndex: "code", render: (code: string, row: { id: number }) => <Link href={`/admin/after-sales/${row.id}`}>{code}</Link> }, { title: "Loại", dataIndex: "type", render: (type: string) => labelOf(AFTER_SALES_TYPE_LABEL, type) }, { title: "Tiêu đề", dataIndex: "subject" }, { title: "Trạng thái", dataIndex: "status", render: (status: string) => labelOf(AFTER_SALES_STATUS_LABEL, status) }, { title: "Ngày tạo", dataIndex: "createdAt", render: (date: string) => formatDate(date) }]} />;
}
