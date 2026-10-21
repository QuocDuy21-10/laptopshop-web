"use client";

import { Alert, Card, Descriptions, Result, Skeleton, Tag } from "antd";
import Link from "next/link";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import styles from "../admin.module.scss";
import { useAdminReview } from "./hooks";
import { ReviewModerationActions } from "./ReviewModerationActions";
import { ReviewStatusTag } from "./ReviewStatusTag";
import { ReviewGallery } from "@/features/reviews/ReviewGallery/ReviewGallery";
import { ReviewReplyEditor } from "./ReviewReplyEditor";

export function ReviewDetail({ id }: { id: number }) {
  const query = useAdminReview(id);
  if (query.isPending) return <Skeleton active />;
  if (!query.data) return isApiError(query.error) && query.error.status === 404 ? <Result status="404" title="Không tìm thấy đánh giá" extra={<Link href="/admin/reviews">Về danh sách</Link>} /> : <Alert type="error" showIcon title={errorMessage(query.error)} />;
  const review = query.data;
  const editedAfterModeration = review.status === "HIDDEN" && review.moderatedAt && review.contentUpdatedAt > review.moderatedAt;
  return <>
    <div className={styles.head}><h1 className={styles.title}>Đánh giá #{review.id}</h1><ReviewStatusTag status={review.status} deleted={Boolean(review.deletedAt)} /><ReviewModerationActions review={review} /></div>
    {editedAfterModeration && <Alert type="warning" showIcon title="Khách đã sửa sau khi review bị ẩn" />}
    <Card title={review.title ?? "Nội dung đánh giá"} className={styles.panel}><p>{review.content}</p><Tag color="gold">{review.rating}/5 sao</Tag><Tag color="blue">{review.helpfulCount} lượt hữu ích</Tag></Card>
    <Card title="Ảnh thực tế" className={styles.panel}><ReviewGallery images={review.images} /></Card>
    <Card title="Tác giả" className={styles.panel}><Descriptions items={[{ key: "name", label: "Họ tên", children: review.author.fullName ?? "—" }, { key: "username", label: "Email", children: review.author.username }, { key: "anonymous", label: "Hiển thị", children: review.isAnonymous ? "Ẩn danh" : "Công khai" }]} /></Card>
    <Card title="Bằng chứng mua hàng" className={styles.panel}><Descriptions items={[{ key: "product", label: "Sản phẩm", children: review.product.name }, { key: "order", label: "Đơn hàng", children: <Link href={`/admin/orders/${review.purchase.orderId}`}>Đơn #{review.purchase.orderId}</Link> }, { key: "status", label: "Trạng thái", children: review.purchase.status }, { key: "payment", label: "Thanh toán", children: review.purchase.paymentStatus }, { key: "completed", label: "Hoàn tất", children: review.purchase.completedAt ? formatDate(review.purchase.completedAt) : "—" }]} /></Card>
    <ReviewReplyEditor review={review} />
  </>;
}
