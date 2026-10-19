"use client";

import { Alert, Card, DatePicker, Skeleton, Statistic, Table, type TableProps } from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { errorMessage } from "@/lib/api/errors";
import { formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";
import { useListParams } from "../useListParams";
import { useSales } from "./hooks";

// recharts measures the DOM, so it only renders in the browser
const SalesChart = dynamic(() => import("./SalesChart"), { ssr: false, loading: () => <Skeleton active /> });

const DAY = "YYYY-MM-DD";
const PRESETS = [7, 30, 90].map((n) => ({
  label: `${n} ngày`,
  value: [dayjs().subtract(n - 1, "day"), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs],
}));

type Top = { productId: number; name: string; quantity: number; revenue: number };
const topColumns: TableProps<Top>["columns"] = [
  { title: "Sản phẩm", dataIndex: "name" },
  { title: "Đã bán", dataIndex: "quantity", align: "right" },
  { title: "Doanh thu", dataIndex: "revenue", align: "right", render: (_, t) => formatVnd(t.revenue) },
];

const valid = (d?: string) => (d && dayjs(d, DAY, true).isValid() ? d : undefined);

export function SalesSection() {
  const { get, set } = useListParams();
  const from = valid(get("salesFrom")) ?? dayjs().subtract(29, "day").format(DAY);
  const to = valid(get("salesTo")) ?? dayjs().format(DAY);
  const { data, isPending, error } = useSales({ from, to });

  return (
    <Card
      title="Doanh thu"
      className={styles.panel}
      extra={
        <DatePicker.RangePicker
          aria-label="Khoảng ngày doanh thu"
          format="DD/MM/YYYY"
          allowClear={false}
          presets={PRESETS}
          value={[dayjs(from, DAY), dayjs(to, DAY)]}
          onChange={(dates) => set({ salesFrom: dates?.[0]?.format(DAY), salesTo: dates?.[1]?.format(DAY) })}
        />
      }
    >
      {isPending ? (
        <Skeleton active />
      ) : !data ? (
        <Alert type="error" showIcon title={errorMessage(error)} />
      ) : (
        <>
          <div className={styles.stats}>
            <Statistic title="Doanh thu hoàn thành" value={data.totals.revenue} formatter={(v) => formatVnd(Number(v))} />
            <Statistic title="Đơn hoàn thành" value={data.totals.orders} />
          </div>
          <SalesChart data={data.daily} />
          <p className={styles.note}>
            Tính theo ngày hoàn thành; đơn hoàn thành trước khi bật tính năng được tính theo ngày đặt.
          </p>
          <Table
            rowKey="productId"
            className={styles.panel}
            columns={topColumns}
            dataSource={data.topProducts}
            pagination={false}
            locale={{ emptyText: "Chưa có đơn hoàn thành trong khoảng này" }}
          />
        </>
      )}
    </Card>
  );
}
