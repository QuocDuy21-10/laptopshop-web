"use client";

import { Alert, DatePicker, Input, Select, Space, Table, Tag, type TableProps } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import type { StockReceiptSummary } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import styles from "../admin.module.scss";
import { ADMIN_PAGE_SIZE, useListParams } from "../useListParams";
import { InventoryNav } from "./InventoryNav";
import { type ReceiptQuery, useReceipts } from "./hooks";
import { paginationItemRender } from "../pagination";

const DAY = "YYYY-MM-DD";
const STATUS_LABEL: Record<StockReceiptSummary["status"], string> = {
  DRAFT: "Bản nháp",
  POSTED: "Đã nhập kho",
};

const columns: TableProps<StockReceiptSummary>["columns"] = [
  {
    title: "Mã phiếu",
    dataIndex: "code",
    render: (_, receipt) => (
      <Link href={`/admin/inventory/receipts/${receipt.id}`}>{receipt.code}</Link>
    ),
  },
  { title: "Nhà cung cấp", dataIndex: "supplierName", render: (value) => value ?? "—" },
  { title: "Số dòng", dataIndex: "itemCount", render: (value) => `${value} dòng` },
  {
    title: "Trạng thái",
    dataIndex: "status",
    render: (status: StockReceiptSummary["status"]) => (
      <Tag color={status === "POSTED" ? "green" : "gold"}>{STATUS_LABEL[status]}</Tag>
    ),
  },
  { title: "Ngày tạo", dataIndex: "createdAt", render: (value) => formatDate(value) },
  { title: "Người tạo", dataIndex: ["createdBy", "name"] },
];

export function ReceiptList() {
  const { get, page, set } = useListParams();
  const status = (get("status") as ReceiptQuery["status"]) || undefined;
  const q = get("q") || undefined;
  const [text, setText] = useState(q ?? "");
  const debounced = useDebouncedValue(text.trim());
  const pushed = useRef(q ?? "");
  // only react to typing: q also changes on back/forward navigation
  useEffect(() => {
    if (debounced !== (q ?? "")) {
      pushed.current = debounced;
      set({ q: debounced || undefined, page: 1 }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  // a q we did not push (back/forward) must show in the input too
  useEffect(() => {
    if ((q ?? "") !== pushed.current) {
      pushed.current = q ?? "";
      setText(q ?? "");
    }
  }, [q]);
  const from = get("from") || undefined;
  const to = get("to") || undefined;
  const range = from && to ? ([dayjs(from, DAY), dayjs(to, DAY)] as const) : null;
  const { data, isFetching, error } = useReceipts({ page, status, q, from, to });

  return (
    <>
      <InventoryNav active="receipts" />
      <div className={styles.head}>
        <h1 className={styles.title}>Phiếu nhập kho</h1>
        <Link className={styles.actions} href="/admin/inventory/receipts/new">
          Tạo phiếu nhập
        </Link>
      </div>
      <Space wrap className={styles.filters}>
        <Input
          allowClear
          placeholder="Tìm mã hoặc nhà cung cấp"
          aria-label="Tìm phiếu nhập"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          aria-label="Lọc trạng thái"
          value={status}
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
          onChange={(value?: ReceiptQuery["status"]) => set({ status: value, page: 1 })}
        />
        <DatePicker.RangePicker
          aria-label="Lọc theo ngày"
          format="DD/MM/YYYY"
          value={range ? [range[0], range[1]] : null}
          onChange={(dates) =>
            set({ from: dates?.[0]?.format(DAY), to: dates?.[1]?.format(DAY), page: 1 })
          }
        />
      </Space>
      {error && (
        <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Chưa có phiếu nhập" }}
        pagination={{
          itemRender: paginationItemRender,
          current: page,
          pageSize: ADMIN_PAGE_SIZE,
          total: data?.meta.total,
          showSizeChanger: false,
          onChange: (nextPage) => set({ page: nextPage }),
        }}
      />
    </>
  );
}
