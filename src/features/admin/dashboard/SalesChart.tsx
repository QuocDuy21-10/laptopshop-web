"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";

const compact = new Intl.NumberFormat("vi-VN", { notation: "compact" });

export default function SalesChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(d: string) => `${d.slice(8)}/${d.slice(5, 7)}`} />
          <YAxis width={56} tickFormatter={(v: number) => compact.format(v)} />
          <Tooltip formatter={(v) => formatVnd(Number(v))} />
          <Bar dataKey="revenue" name="Doanh thu" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
