const vnd = new Intl.NumberFormat("vi-VN");
const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export const formatVnd = (value: number) => `${vnd.format(value)} ₫`;

export const formatDate = (iso: string) => dateTime.format(new Date(iso));
