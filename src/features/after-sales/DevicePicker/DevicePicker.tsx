"use client";

import type { AfterSalesDevice } from "../types";
import styles from "./DevicePicker.module.scss";

export type SelectedDevice = { key: string; device: AfterSalesDevice; unitIndex: number };

export function DevicePicker({ devices, selected, onToggle }: { devices: AfterSalesDevice[]; selected: SelectedDevice[]; onToggle: (unit: SelectedDevice) => void }) {
  const selectedKeys = new Set(selected.map((item) => item.key));
  return <div className={styles.list} aria-label="Chọn thiết bị">
    {devices.map((device) => Array.from({ length: device.availableCount }, (_, unitIndex) => {
      const key = `${device.orderDetailId}-${unitIndex}`;
      return <label className={styles.row} key={key} aria-label={`Chọn thiết bị ${device.product.name} ${unitIndex + 1}`}>
        <input type="checkbox" checked={selectedKeys.has(key)} onChange={() => onToggle({ key, device, unitIndex })} />
        <span><strong>{device.product.name}</strong><small>Đơn #{device.orderId} · Thiết bị {unitIndex + 1}</small></span>
      </label>;
    }))}
  </div>;
}
