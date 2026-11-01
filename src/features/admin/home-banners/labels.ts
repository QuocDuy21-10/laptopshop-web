import type { AdminHomeBanner } from "@/lib/api/types";

export const placementLabel: Record<AdminHomeBanner["placement"], string> = {
  HERO: "Banner hero",
  SIDE: "Thẻ ưu đãi",
};

export const statusLabel: Record<AdminHomeBanner["status"], string> = {
  ACTIVE: "Đang hiển thị",
  SCHEDULED: "Hẹn giờ",
  EXPIRED: "Hết hạn",
  INACTIVE: "Đang tắt",
};

export const statusColor: Record<AdminHomeBanner["status"], "success" | "processing" | "default" | "warning"> = {
  ACTIVE: "success",
  SCHEDULED: "processing",
  EXPIRED: "warning",
  INACTIVE: "default",
};
