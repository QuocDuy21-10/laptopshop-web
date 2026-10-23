"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { errorMessage } from "@/lib/api/errors";
import { useAfterSalesDevices, useCreateAfterSalesRequest } from "../hooks";
import { createServiceRequestSchema } from "../schema";
import type { AfterSalesDevice } from "../types";
import { DevicePicker, type SelectedDevice } from "../DevicePicker/DevicePicker";
import styles from "./ServiceRequestForm.module.scss";

export function ServiceRequestForm({ userId, type, preselectedOrderDetailId }: { userId: number; type: "WARRANTY" | "TECHNICAL_SUPPORT"; preselectedOrderDetailId?: number }) {
  const devices = useAfterSalesDevices(userId, type);
  const create = useCreateAfterSalesRequest(userId);
  const [selected, setSelected] = useState<SelectedDevice[]>([]);
  const [subject, setSubject] = useState("");
  const [issue, setIssue] = useState<Record<string, string>>({});
  const available = useMemo(() => (devices.data?.data ?? []).filter((device) => preselectedOrderDetailId === undefined || device.orderDetailId === preselectedOrderDetailId), [devices.data, preselectedOrderDetailId]);
  const toggle = (unit: SelectedDevice) => setSelected((current) => current.some((item) => item.key === unit.key) ? current.filter((item) => item.key !== unit.key) : [...current, unit]);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { type, subject, items: selected.map((item) => ({ orderDetailId: item.device.orderDetailId, deviceLabel: `${item.device.product.name} · Thiết bị ${item.unitIndex + 1}`, issueDescription: issue[item.key] ?? "" })) };
    const parsed = createServiceRequestSchema.safeParse(payload);
    if (!parsed.success) return;
    create.mutate(parsed.data);
  };
  if (devices.isPending) return <p>Đang tải thiết bị…</p>;
  if (devices.isError) return <Alert tone="error" title={errorMessage(devices.error)} />;
  return <form className={styles.form} onSubmit={submit}>
    <h1>{type === "WARRANTY" ? "Gửi yêu cầu bảo hành" : "Gửi yêu cầu hỗ trợ kỹ thuật"}</h1>
    <label>Tiêu đề<input value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={200} /></label>
    <DevicePicker devices={available as AfterSalesDevice[]} selected={selected} onToggle={toggle} />
    {selected.map((item) => <label key={item.key}>Mô tả lỗi — {item.device.product.name} {item.unitIndex + 1}<textarea value={issue[item.key] ?? ""} onChange={(event) => setIssue((current) => ({ ...current, [item.key]: event.target.value }))} required maxLength={5000} /></label>)}
    {create.isError && <Alert tone="error" title={errorMessage(create.error)} />}
    {create.isSuccess && <Alert tone="success" title="Đã tạo yêu cầu hậu mãi" />}
    <Button type="submit" loading={create.isPending} disabled={selected.length === 0}>Gửi yêu cầu</Button>
  </form>;
}
