"use client";

import { Alert, Button, Input, Modal, Space, Table, Tag, type TableProps } from "antd";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import type { PaymentReviewCase } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import styles from "../admin.module.scss";
import {
  useExtendPaymentReviewCase,
  usePaymentReviewCases,
  useReleasePaymentReviewCase,
} from "./hooks";

export function PaymentReviewCaseList() {
  const { data, error, isFetching } = usePaymentReviewCases({ page: 1, status: "OPEN" });
  const [selected, setSelected] = useState<PaymentReviewCase | null>(null);
  const [action, setAction] = useState<"extend" | "release" | null>(null);
  const [note, setNote] = useState("");
  const [holdUntil, setHoldUntil] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const extend = useExtendPaymentReviewCase(selected?.id ?? "");
  const release = useReleasePaymentReviewCase(selected?.id ?? "");

  const close = () => {
    setSelected(null);
    setAction(null);
    setNote("");
    setHoldUntil("");
    setConfirmation("");
  };

  const columns: TableProps<PaymentReviewCase>["columns"] = [
    { title: "Mở lúc", dataIndex: "openedAt", render: (value) => formatDate(value) },
    { title: "Đơn hàng", render: (_, item) => `#${item.payment.orderId}` },
    { title: "Mã thanh toán", render: (_, item) => item.payment.transferCode },
    { title: "Lý do", dataIndex: "reason", render: (value) => <Tag color="orange">{value}</Tag> },
    { title: "Trạng thái", dataIndex: "status" },
    {
      title: "Thao tác",
      render: (_, item) => (
        <Space>
          <Button onClick={() => { setSelected(item); setAction("extend"); }}>Gia hạn giữ hàng</Button>
          <Button danger onClick={() => { setSelected(item); setAction("release"); }}>Giải phóng tồn kho</Button>
        </Space>
      ),
    },
  ];

  const submit = () => {
    if (!selected) return;
    if (action === "extend") {
      extend.mutate({ note, holdUntil, version: selected.version }, { onSuccess: close });
    } else if (action === "release") {
      release.mutate({ note, confirmation: "RELEASE_STOCK", version: selected.version }, { onSuccess: close });
    }
  };

  const busy = extend.isPending || release.isPending;
  const canSubmit = Boolean(note.trim()) && (action === "extend" ? Boolean(holdUntil) : confirmation === "RELEASE_STOCK");

  return (
    <section>
      <div className={styles.head}><h2 className={styles.title}>Đơn chờ xác minh</h2></div>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table rowKey="id" columns={columns} dataSource={data?.data} loading={isFetching} pagination={false} scroll={{ x: "max-content" }} />
      <Modal
        open={Boolean(selected && action)}
        title={action === "release" ? "Giải phóng tồn kho chưa xác minh" : "Gia hạn giữ hàng"}
        okText={action === "release" ? "Xác nhận giải phóng" : "Lưu gia hạn"}
        cancelText="Huỷ"
        confirmLoading={busy}
        okButtonProps={{ disabled: !canSubmit, danger: action === "release" }}
        onCancel={close}
        onOk={submit}
      >
        {action === "release" && <Alert type="warning" showIcon title="Giao dịch đến muộn có thể cần xử lý hoàn tiền thủ công." />}
        {action === "extend" && <Input placeholder="Thời điểm xem lại (ISO)" value={holdUntil} onChange={(event) => setHoldUntil(event.target.value)} />}
        {action === "release" && <Input placeholder="Nhập RELEASE_STOCK" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />}
        <Input.TextArea placeholder={action === "extend" ? "Ghi chú gia hạn" : "Ghi chú xử lý"} value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
      </Modal>
    </section>
  );
}
