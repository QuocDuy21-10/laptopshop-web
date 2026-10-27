export const PAYMENT_EVENT_STATUS: Record<string, { label: string; color: string }> = {
  MATCHED: { label: "Đã khớp đơn", color: "success" },
  REVIEW_REQUIRED: { label: "Cần xem xét", color: "warning" },
  RESOLVED: { label: "Đã xử lý", color: "default" },
};

export const PAYMENT_CASE_STATUS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Đang mở", color: "warning" },
  RESOLVED: { label: "Đã xử lý", color: "default" },
};

// review reasons are free strings from the API: unknown ones are shown as sent so staff can still act on them
export const PAYMENT_REVIEW_REASON_LABEL: Record<string, string> = {
  OUTBOUND: "Giao dịch chuyển ra",
  UNKNOWN_CODE: "Không tìm thấy mã đơn",
  INVALID_PAYMENT_STATE: "Trạng thái thanh toán không hợp lệ",
  AMOUNT_MISMATCH: "Sai số tiền",
};

export const reviewReasonLabel = (value: string | null | undefined) =>
  value ? (PAYMENT_REVIEW_REASON_LABEL[value] ?? value) : "—";

export const statusTag = (map: Record<string, { label: string; color: string }>, value: string) =>
  map[value] ?? { label: "Không xác định", color: "default" };
