const vnd = new Intl.NumberFormat("vi-VN");
const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

// non-breaking space keeps the amount and the đồng sign on one line
export const formatVnd = (value: number) => `${vnd.format(value)}\u00a0₫`;

export const formatDate = (iso: string) => dateTime.format(new Date(iso));
