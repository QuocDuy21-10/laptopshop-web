"use client";

import { Alert, DatePicker, Select, Space, Table, Tag, type TableProps } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { errorMessage } from "@/lib/api/errors";
import type { StockMovement } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import styles from "../admin.module.scss";
import { ExportCsvButton } from "../ExportCsvButton";
import { useListParams } from "../useListParams";
import { type MovementQuery, useStockMovements } from "./hooks";
import { REASON_LABEL } from "./labels";

const DAY = "YYYY-MM-DD";
const REASONS = Object.keys(REASON_LABEL);

const columns: TableProps<StockMovement>["columns"] = [
  { title: "Thời gian", dataIndex: "createdAt", render: (_, m) => formatDate(m.createdAt) },
  { title: "Sản phẩm", dataIndex: "productName", render: (_, m) => <Link href={`/admin/products/${m.productId}`}>{m.productName}</Link> },
  {
    title: "Thay đổi",
    dataIndex: "delta",
    align: "right",
    render: (_, m) => <Tag color={m.delta > 0 ? "green" : "red"}>{m.delta > 0 ? `+${m.delta}` : m.delta}</Tag>,
  },
  { title: "Lý do", dataIndex: "reason", render: (_, m) => REASON_LABEL[m.reason] ?? m.reason },
  { title: "Đơn hàng", dataIndex: "orderId", render: (_, m) => (m.orderId ? <Link href={`/admin/orders/${m.orderId}`}>#{m.orderId}</Link> : "—") },
  { title: "Người thao tác", key: "actor", render: (_, m) => m.actor?.name ?? "—" },
  { title: "Ghi chú", dataIndex: "note", render: (_, m) => m.note ?? "—" },
];

export function MovementList() {
  const { get, page, set } = useListParams();
  const productId = Number(get("productId")) || undefined;
  const reason = REASONS.find((r) => r === get("reason")) as MovementQuery["reason"];
  const from = get("from");
  const to = get("to");
  const range = from && to && dayjs(from, DAY).isValid() && dayjs(to, DAY).isValid() ? ([dayjs(from, DAY), dayjs(to, DAY)] as const) : null;
  const { data, isFetching, error } = useStockMovements({ page, productId, reason, from, to });

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Nhật ký kho</h1>
        <ExportCsvButton path="/api/v1/admin/inventory/movements/export.csv" query={{ productId, reason, from, to }} />
      </div>
      <Space wrap className={styles.filters}>
        {productId && (
          <Tag closable onClose={() => set({ productId: undefined })}>
            Sản phẩm #{productId}
          </Tag>
        )}
        <Select
          allowClear
          placeholder="Lý do"
          aria-label="Lọc theo lý do"
          className={styles.select}
          value={reason}
          options={REASONS.map((r) => ({ value: r, label: REASON_LABEL[r] }))}
          onChange={(v?: string) => set({ reason: v })}
        />
        <DatePicker.RangePicker
          aria-label="Lọc theo ngày"
          format="DD/MM/YYYY"
          value={range ? [range[0], range[1]] : null}
          onChange={(dates) => set({ from: dates?.[0]?.format(DAY), to: dates?.[1]?.format(DAY) })}
        />
      </Space>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Chưa có biến động kho" }}
        pagination={{ current: page, pageSize: 10, total: data?.meta.total, showSizeChanger: false, onChange: (p) => set({ page: p }) }}
      />
    </>
  );
}
