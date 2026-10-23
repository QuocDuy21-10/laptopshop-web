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
