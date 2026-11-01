"use client";

import { Alert, Input, Segmented, Space, Table, Tag, Typography, type TableProps } from "antd";
import { errorMessage } from "@/lib/api/errors";
import type { NewsletterSubscriber } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import styles from "../admin.module.scss";
import { ExportCsvButton } from "../ExportCsvButton";
import { paginationItemRender } from "../pagination";
import { ADMIN_PAGE_SIZE, useListParams } from "../useListParams";
import { useAdminNewsletterSubscribers, type NewsletterSubscriberQuery } from "./hooks";
import { statusColor, statusLabel } from "./labels";

type View = NewsletterSubscriber["status"] | "ALL";

const VIEWS: { value: View; label: string }[] = [
  { value: "CONFIRMED", label: statusLabel.CONFIRMED },
  { value: "PENDING", label: statusLabel.PENDING },
  { value: "UNSUBSCRIBED", label: statusLabel.UNSUBSCRIBED },
  { value: "ALL", label: "Tất cả" },
];

const dateCell = (iso: string | null) => (iso ? formatDate(iso) : "—");

export function NewsletterSubscriberList() {
  const { get, page, set } = useListParams();
  const raw = get("status");
  // the API exports one status at a time (confirmed by default), so the list opens on the useful view
  const view: View = raw === "PENDING" || raw === "UNSUBSCRIBED" || raw === "ALL" ? raw : "CONFIRMED";
  const query: NewsletterSubscriberQuery = {
    page,
    pageSize: ADMIN_PAGE_SIZE,
    status: view === "ALL" ? undefined : view,
    q: get("q"),
  };
  const { data, isFetching, error } = useAdminNewsletterSubscribers(query);

  const columns: TableProps<NewsletterSubscriber>["columns"] = [
    { title: "Email", dataIndex: "email" },
    { title: "Trạng thái", render: (_, s) => <Tag color={statusColor[s.status]}>{statusLabel[s.status] ?? "Không xác định"}</Tag> },
    { title: "Ngày đăng ký", render: (_, s) => dateCell(s.createdAt) },
    { title: "Ngày xác nhận", render: (_, s) => dateCell(s.confirmedAt) },
    { title: "Ngày hủy", render: (_, s) => dateCell(s.unsubscribedAt) },
  ];

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Đăng ký nhận tin</h1>
        {view === "ALL" ? (
          <Typography.Text type="secondary">Chọn một trạng thái để xuất CSV</Typography.Text>
        ) : (
          <ExportCsvButton
            path="/api/v1/admin/newsletter/subscribers/export.csv"
            query={{ status: view, q: query.q }}
          />
        )}
      </div>
      <Space wrap className={styles.filters}>
        <Segmented options={VIEWS} value={view} onChange={(v) => set({ status: String(v) })} />
        <Input.Search
          key={get("q")}
          placeholder="Tìm theo email"
          aria-label="Tìm đăng ký theo email"
          allowClear
          defaultValue={get("q")}
          onSearch={(q) => set({ q: q.trim() })}
        />
      </Space>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Chưa có đăng ký nào" }}
        pagination={{
          itemRender: paginationItemRender,
          current: page,
          pageSize: ADMIN_PAGE_SIZE,
          total: data?.meta.total,
          showSizeChanger: false,
          onChange: (p) => set({ page: p }),
        }}
      />
    </>
  );
}
