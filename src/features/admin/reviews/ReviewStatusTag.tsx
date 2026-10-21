import { Tag } from "antd";

export function ReviewStatusTag({ status, deleted }: { status: string; deleted: boolean }) {
  if (deleted) return <Tag color="default">Đã xoá</Tag>;
  return <Tag color={status === "HIDDEN" ? "orange" : "success"}>{status === "HIDDEN" ? "Đã ẩn" : "Hiển thị"}</Tag>;
}
