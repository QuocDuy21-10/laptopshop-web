"use client";

import { Alert, Card, Col, Input, Row, Select, Space, Statistic, Table, Tag, type TableProps } from "antd";
import Link from "next/link";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import type { AdminReviewListItem } from "@/lib/api/types";
import styles from "../admin.module.scss";
import { useListParams } from "../useListParams";
import { ReviewStatusTag } from "./ReviewStatusTag";
import { useAdminReviewSummary, useAdminReviews } from "./hooks";
import { paginationItemRender } from "../pagination";

export function ReviewList() {
  const { get, page, set } = useListParams();
  const query = { page, q: get("q"), productId: get("productId") ? Number(get("productId")) : undefined, rating: get("rating") ? Number(get("rating")) : undefined, status: get("status") as "PUBLISHED" | "HIDDEN" | undefined, deleted: get("deleted") as "true" | "false" | undefined };
  const reviews = useAdminReviews(query);
  const summary = useAdminReviewSummary();
  const columns: TableProps<AdminReviewListItem>["columns"] = [
    { title: "Ngày", dataIndex: "createdAt", render: (value: string) => formatDate(value) },
    { title: "Sản phẩm", render: (_: unknown, row: AdminReviewListItem) => <Link href={`/admin/reviews/${row.id}`}>{row.product.name}</Link> },
    { title: "Khách hàng", render: (_: unknown, row: AdminReviewListItem) => <><span>{row.author.fullName ?? row.author.username}</span>{row.isAnonymous && <Tag>Ẩn danh</Tag>}</> },
    { title: "Sao", dataIndex: "rating" },
    { title: "Trạng thái", render: (_: unknown, row: AdminReviewListItem) => <ReviewStatusTag status={row.status} deleted={Boolean(row.deletedAt)} /> },
  ];
  return <>
    <div className={styles.head}><h1 className={styles.title}>Đánh giá</h1></div>
    <Row gutter={[16, 16]} className={styles.stats}>
      <Col xs={12} lg={6}><Card><Statistic title="Tổng hoạt động" value={summary.data?.totalReviews ?? 0} /></Card></Col>
      <Col xs={12} lg={6}><Card><Statistic title="Rating trung bình" value={summary.data?.averageRating ?? "—"} precision={1} /></Card></Col>
      <Col xs={12} lg={6}><Card><Statistic title="Đang ẩn" value={summary.data?.hiddenReviews ?? 0} /></Card></Col>
      <Col xs={12} lg={6}><Card><Statistic title="Đã xoá" value={summary.data?.deletedReviews ?? 0} /></Card></Col>
    </Row>
    <Space wrap className={styles.filters}>
      <Input.Search aria-label="Tìm đánh giá" placeholder="Sản phẩm hoặc khách hàng" allowClear onSearch={(value) => set({ q: value.trim() })} />
      <Select aria-label="Lọc trạng thái" placeholder="Trạng thái" allowClear value={query.status} options={[{ value: "PUBLISHED", label: "Hiển thị" }, { value: "HIDDEN", label: "Đã ẩn" }]} onChange={(value) => set({ status: value })} />
      <Select aria-label="Lọc số sao" placeholder="Số sao" allowClear value={query.rating} options={[1, 2, 3, 4, 5].map((value) => ({ value, label: `${value} sao` }))} onChange={(value) => set({ rating: value })} />
      <Select aria-label="Lọc trạng thái xoá" placeholder="Đã xoá?" allowClear value={query.deleted} options={[{ value: "true", label: "Đã xoá" }, { value: "false", label: "Đang hoạt động" }]} onChange={(value) => set({ deleted: value })} />
    </Space>
    {reviews.error && <Alert type="error" showIcon title={errorMessage(reviews.error)} />}
    <Table rowKey="id" columns={columns} dataSource={reviews.data?.data} loading={reviews.isFetching} scroll={{ x: "max-content" }} pagination={{ itemRender: paginationItemRender, current: page, pageSize: 10, total: reviews.data?.meta.total, showSizeChanger: false, onChange: (nextPage) => set({ page: nextPage }) }} />
  </>;
}
