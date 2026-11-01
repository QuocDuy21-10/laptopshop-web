"use client";

import { Select } from "antd";
import { useState } from "react";
import { useAdminProducts } from "@/features/admin/products/hooks";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

/** Multi-select of active products, driven by Form.Item (value/onChange). */
export function PromotionTargetSelect({ id, value = [], onChange }: { id?: string; value?: number[]; onChange?: (value: number[]) => void }) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const products = useAdminProducts({ page: 1, pageSize: 20, q: q || undefined, isActive: true });
  // labels survive a new search: keep what was picked, then the current results
  const [picked, setPicked] = useState<Record<number, string>>({});
  const names: Record<number, string> = { ...picked, ...Object.fromEntries((products.data?.data ?? []).map((product) => [product.id, product.name])) };

  return (
    <Select
      id={id}
      mode="multiple"
      aria-label="Sản phẩm áp dụng"
      showSearch
      filterOption={false}
      placeholder="Tìm sản phẩm"
      value={value}
      options={Object.entries(names).map(([productId, label]) => ({ value: Number(productId), label }))}
      onSearch={setSearch}
      onChange={(next: number[]) => {
        setPicked((known) => ({ ...known, ...Object.fromEntries(next.map((productId) => [productId, names[productId]])) }));
        onChange?.(next);
      }}
    />
  );
}
