export const AFTER_SALES_TYPE_LABEL = {
  WARRANTY: "Bảo hành",
  TECHNICAL_SUPPORT: "Hỗ trợ kỹ thuật",
} as const;

export const AFTER_SALES_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Chờ tiếp nhận",
  REVIEWING: "Đang xác minh",
  IN_PROGRESS: "Đang xử lý",
  AWAITING_CUSTOMER: "Chờ khách phản hồi",
  PARTIALLY_COMPLETED: "Hoàn tất một phần",
  CLOSED: "Đã đóng",
};

// status of one device inside a request (API enum on PATCH .../items/{itemId}/status)
export const AFTER_SALES_ITEM_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Chờ tiếp nhận",
  REVIEWING: "Đang xác minh",
  APPROVED: "Đã duyệt",
  AWAITING_ITEM: "Chờ gửi thiết bị",
  RECEIVED: "Đã nhận thiết bị",
  DIAGNOSING: "Đang kiểm tra",
  AWAITING_QUOTE_DECISION: "Chờ khách duyệt báo giá",
  IN_SERVICE: "Đang xử lý",
  READY_FOR_RETURN: "Sẵn sàng trả máy",
  RETURNED: "Đã trả thiết bị",
  RESOLVED: "Chờ xác nhận",
  CLOSED: "Đã đóng",
  REJECTED: "Từ chối",
  CANCELLED: "Đã huỷ",
};

// timeline event kinds are free strings from the API; unknown kinds fall back to a generic label
export const AFTER_SALES_EVENT_LABEL: Record<string, string> = {
  REQUEST_CREATED: "Đã tạo yêu cầu",
  STATUS_CHANGED: "Cập nhật trạng thái",
  PUBLIC_MESSAGE: "Tin nhắn",
  INTERNAL_NOTE: "Ghi chú nội bộ",
};

export const AFTER_SALES_EVENT_FALLBACK = "Cập nhật yêu cầu";
