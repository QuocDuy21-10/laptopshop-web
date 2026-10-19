"use client";

import { DatePicker, Input, Segmented, Space } from "antd";
import dayjs from "dayjs";
import { ORDER_STATUS_LABEL } from "@/features/orders/labels";
import styles from "../admin.module.scss";
import { useListParams } from "../useListParams";
import { OrdersTable } from "./OrdersTable";
import { ORDER_STATUSES } from "./transitions";

const FILTER_OPTIONS = [{ value: "", label: "Tất cả" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))];
const DAY = "YYYY-MM-DD";

export function OrderList() {
  const { get, page, set } = useListParams();
  const raw = get("status");
  const status = ORDER_STATUSES.find((s) => s === raw);
  const from = get("from");
  const to = get("to");
  const range = from && to && dayjs(from, DAY).isValid() && dayjs(to, DAY).isValid() ? ([dayjs(from, DAY), dayjs(to, DAY)] as const) : null;

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Đơn hàng</h1>
      </div>
      <Space wrap className={styles.filters}>
        <Segmented options={FILTER_OPTIONS} value={status ?? ""} onChange={(v) => set({ status: String(v) })} />
        <Input.Search
          key={get("q")}
          placeholder="Mã đơn, tên hoặc SĐT người nhận"
          aria-label="Tìm đơn hàng"
          allowClear
          defaultValue={get("q")}
          onSearch={(q) => set({ q: q.trim() })}
        />
        <DatePicker.RangePicker
          aria-label="Lọc theo ngày đặt"
          format="DD/MM/YYYY"
          value={range ? [range[0], range[1]] : null}
          onChange={(dates) => set({ from: dates?.[0]?.format(DAY), to: dates?.[1]?.format(DAY) })}
        />
      </Space>
      <OrdersTable query={{ page, status, q: get("q"), from, to }} onPage={(p) => set({ page: p })} />
    </>
  );
}
