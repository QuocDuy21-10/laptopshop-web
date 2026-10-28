"use client";

import { Button, Select } from "antd";
import { useState, type ChangeEvent } from "react";
import { useAdminProducts } from "@/features/admin/products/hooks";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import styles from "./FlashSaleAdmin.module.scss";

export type FlashSaleQuotaItem = { productId: number; totalQuota: number; maxUnitsPerUser: number };

const EMPTY_ITEM: FlashSaleQuotaItem = { productId: 0, totalQuota: 1, maxUnitsPerUser: 1 };

export function validateQuotaItems(items: FlashSaleQuotaItem[], minTotals: Record<number, number> = {}): string | null {
  if (items.length === 0) return "Cần ít nhất một sản phẩm Flash Sale.";
  if (items.some((item) => item.productId <= 0)) return "Chọn sản phẩm cho mọi dòng quota.";
  if (items.some((item, index) => items.findIndex((other) => other.productId === item.productId) !== index)) {
    return "Sản phẩm Flash Sale không được trùng.";
  }
  if (items.some((item) => !Number.isInteger(item.totalQuota) || item.totalQuota < 1 || !Number.isInteger(item.maxUnitsPerUser) || item.maxUnitsPerUser < 1)) {
    return "Quota phải là số nguyên dương.";
  }
  if (items.some((item) => item.maxUnitsPerUser > item.totalQuota)) return "Giới hạn mỗi user không được vượt quota tổng.";
  if (items.some((item) => item.totalQuota < (minTotals[item.productId] ?? 0))) return "Không được giảm quota tổng.";
  return null;
}

export function FlashSaleQuotaEditor({
  value,
  onChange,
  locked = false,
  productNames = {},
  minTotals,
}: {
  value: FlashSaleQuotaItem[];
  onChange: (value: FlashSaleQuotaItem[]) => void;
  /** Activated promotion: products and per-user limits are fixed, rows cannot be added or removed. */
  locked?: boolean;
  productNames?: Record<number, string>;
  /** Lowest total quota allowed per product (an activated promotion can only grow). */
  minTotals?: Record<number, number>;
}) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const products = useAdminProducts({ page: 1, pageSize: 20, q: q || undefined, isActive: true });
  const found = products.data?.data;
  // labels survive a new search: keep what was picked, then the current results
  const [picked, setPicked] = useState<Record<number, string>>({});
  const names: Record<number, string> = { ...productNames, ...picked, ...Object.fromEntries((found ?? []).map((product) => [product.id, product.name])) };

  const patch = (index: number, change: Partial<FlashSaleQuotaItem>) =>
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...change } : item)));
  const update = (index: number, field: "totalQuota" | "maxUnitsPerUser") => (event: ChangeEvent<HTMLInputElement>) =>
    patch(index, { [field]: Number(event.target.value) });
  const taken = new Set(value.map((item) => item.productId));
  const options = (current: number) =>
    Object.entries(names).map(([id, label]) => ({ value: Number(id), label, disabled: Number(id) !== current && taken.has(Number(id)) }));
  const error = validateQuotaItems(value, minTotals);

  return (
    <section className={styles.panel} aria-label="Quota Flash Sale">
      <h3>Quota theo sản phẩm</h3>
      {value.map((item, index) => (
        <div className={styles.row} key={index}>
          <label>
            Sản phẩm dòng {index + 1}
            <Select
              aria-label={`Sản phẩm dòng ${index + 1}`}
              showSearch
              filterOption={false}
              value={item.productId > 0 ? item.productId : undefined}
              placeholder="Tìm sản phẩm"
              disabled={locked}
              options={options(item.productId)}
              onSearch={setSearch}
              onChange={(productId: number) => {
                setPicked((known) => ({ ...known, [productId]: names[productId] }));
                patch(index, { productId });
              }}
            />
          </label>
          <label>
            Quota tổng
            <input aria-label={`Quota tổng dòng ${index + 1}`} type="number" min={minTotals?.[item.productId] ?? 1} value={item.totalQuota} onChange={update(index, "totalQuota")} />
          </label>
          <label>
            Tối đa mỗi user
            <input aria-label={`Tối đa mỗi user dòng ${index + 1}`} type="number" min={1} value={item.maxUnitsPerUser} disabled={locked} onChange={update(index, "maxUnitsPerUser")} />
          </label>
          {!locked && (
            <Button aria-label={`Xoá dòng ${index + 1}`} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>
              Xoá
            </Button>
          )}
        </div>
      ))}
      {!locked && <Button onClick={() => onChange([...value, EMPTY_ITEM])}>Thêm sản phẩm</Button>}
      {error && value.length > 0 && <p role="alert">{error}</p>}
    </section>
  );
}
