import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";

export function NotificationEmptyState() {
  return (
    <EmptyState
      icon={<Bell size={40} aria-hidden="true" />}
      title="Chưa có thông báo nào"
      description="Cập nhật về đơn hàng, thanh toán và giá sản phẩm bạn theo dõi sẽ hiện ở đây."
    />
  );
}
