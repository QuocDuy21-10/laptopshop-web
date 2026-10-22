"use client";

import type { ChangeEvent } from "react";
import styles from "./FlashSaleAdmin.module.scss";

export type FlashSaleQuotaItem = { productId: number; totalQuota: number; maxUnitsPerUser: number };

export function FlashSaleQuotaEditor({
  value,
  onChange,
  locked = false,
}: {
  value: FlashSaleQuotaItem[];
  onChange: (value: FlashSaleQuotaItem[]) => void;
  locked?: boolean;
}) {
  const update = (index: number, field: keyof FlashSaleQuotaItem) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = value.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: Number(event.target.value) } : item);
    onChange(next);
  };
  const duplicate = value.some((item, index) => value.findIndex((other) => other.productId === item.productId) !== index);
  const invalidLimit = value.some((item) => item.maxUnitsPerUser > item.totalQuota);
  return (
    <section className={styles.panel} aria-label="Quota Flash Sale">
      <h3>Quota theo sản phẩm</h3>
      {value.map((item, index) => (
        <div className={styles.row} key={`${item.productId}-${index}`}>
          <label> Sản phẩm dòng {index + 1}
            <input aria-label={`Sản phẩm dòng ${index + 1}`} type="number" min={1} value={item.productId} disabled={locked} onChange={update(index, "productId")} />
          </label>
          <label>Quota tổng
            <input aria-label={`Quota tổng dòng ${index + 1}`} type="number" min={1} value={item.totalQuota} onChange={update(index, "totalQuota")} />
          </label>
          <label>Tối đa mỗi user
            <input aria-label={`Tối đa mỗi user dòng ${index + 1}`} type="number" min={1} value={item.maxUnitsPerUser} disabled={locked} onChange={update(index, "maxUnitsPerUser")} />
          </label>
        </div>
      ))}
      {duplicate && <p role="alert">Sản phẩm Flash Sale không được trùng.</p>}
      {invalidLimit && <p role="alert">Giới hạn mỗi user không được vượt quota tổng.</p>}
    </section>
  );
}
