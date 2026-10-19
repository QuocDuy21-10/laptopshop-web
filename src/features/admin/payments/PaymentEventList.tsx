"use client";

import { Alert, Button, Input, Modal, Select, Space, Table, Tag, type TableProps } from "antd";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import type { PaymentEvent } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import styles from "../admin.module.scss";
import { useListParams } from "../useListParams";
import { type PaymentEventQuery, usePaymentEvents, useResolvePaymentEvent } from "./hooks";

const columns = (onResolve: (event: PaymentEvent) => void): TableProps<PaymentEvent>["columns"] => [
  { title: "Thời gian", dataIndex: "receivedAt", render: (_, e) => formatDate(e.receivedAt) },
  { title: "Mã giao dịch", dataIndex: "providerTransactionKey" },
  { title: "Nội dung", dataIndex: "transferCode", render: (v) => v ?? "—" },
  { title: "Số tiền", dataIndex: "amount", render: (v) => `${Number(v).toLocaleString("vi-VN")} ₫` },
  { title: "Lý do", dataIndex: "reviewReason", render: (v) => <Tag color="orange">{v ?? "—"}</Tag> },
  { title: "Trạng thái", dataIndex: "status" },
  { title: "Thao tác", render: (_, e) => e.status === "REVIEW_REQUIRED" ? <Button onClick={() => onResolve(e)}>Đánh dấu đã xử lý</Button> : null },
];

export function PaymentEventList() {
  const { get, page, set } = useListParams();
  const status = get("status") as PaymentEventQuery["status"];
  const reason = get("reason");
  const { data, error, isFetching } = usePaymentEvents({ page, status, reason });
  const [selected, setSelected] = useState<PaymentEvent | null>(null);
  const [note, setNote] = useState("");
  const resolve = useResolvePaymentEvent(selected?.id ?? "");

  return <>
    <div className={styles.head}><h1 className={styles.title}>Đối soát thanh toán</h1></div>
    <Space wrap className={styles.filters}>
      <Select aria-label="Lọc trạng thái" placeholder="Trạng thái" allowClear value={status} options={["REVIEW_REQUIRED", "RESOLVED", "MATCHED"].map((v) => ({ value: v, label: v }))} onChange={(v) => set({ status: v })} />
      <Input aria-label="Lọc lý do" placeholder="Review reason" value={reason} onChange={(e) => set({ reason: e.target.value })} />
    </Space>
    {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
    <Table rowKey="id" columns={columns((event) => { setSelected(event); setNote(""); })} dataSource={data?.data} loading={isFetching} scroll={{ x: "max-content" }} pagination={{ current: page, pageSize: 10, total: data?.meta.total, showSizeChanger: false, onChange: (p) => set({ page: p }) }} />
    <Modal open={Boolean(selected)} title="Đánh dấu sự kiện đã xử lý" okText="Lưu" cancelText="Huỷ" confirmLoading={resolve.isPending} okButtonProps={{ disabled: !note.trim() }} onCancel={() => setSelected(null)} onOk={() => selected && resolve.mutate(note, { onSuccess: () => setSelected(null) })}>
      <p>{selected?.providerTransactionKey}</p><Input.TextArea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú xử lý ngoài hệ thống" rows={4} />
    </Modal>
  </>;
}
