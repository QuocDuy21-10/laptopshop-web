# Data dictionary: Newsletter

Contract dữ liệu của module [Newsletter](../../04-features/newsletter.md). Cách đọc ở [README](README.md). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## NewsletterSubscriber (admin)

Nguồn: `components["schemas"]["NewsletterSubscriber"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L11170-L11181).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã người đăng ký | khóa bảng |
| `email` | `string` | Có | Không | Email (chữ thường) | cột Email |
| `status` | `"PENDING" \| "CONFIRMED" \| "UNSUBSCRIBED"` | Có | Không | Trạng thái | cột Trạng thái |
| `confirmedAt` | `string` (ISO) | Có | Có | Thời điểm xác nhận | không hiển thị trong bảng; có trong CSV |
| `unsubscribedAt` | `string` (ISO) | Có | Có | Thời điểm hủy | không hiển thị trong bảng; có trong CSV |
| `createdAt` | `string` (ISO) | Có | Không | Thời điểm đăng ký | không hiển thị trong bảng; có trong CSV |

Nhãn trạng thái: "Chờ xác nhận", "Đã xác nhận", "Đã hủy" ([labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/newsletter/labels.ts#L3-L7)). Cột `confirmTokenHash`, `confirmExpiresAt`, `lastConfirmationSentAt` chỉ ở backend, không lộ qua API.

## Body

| Request | Field | Ràng buộc |
| --- | --- | --- |
| `POST /newsletter/subscribe` | `email` | cắt khoảng trắng, hợp lệ, tối đa 254; backend đưa về chữ thường |
| `POST /newsletter/confirm` | `token` | 1 đến 200 ký tự; giá trị ngẫu nhiên 32 byte mã hóa base64url |
| `POST /newsletter/unsubscribe` | `token` | 1 đến 200 ký tự; dạng `id.chữ_ký` (id 1 đến 10 chữ số, chữ ký 43 ký tự base64url) |

## Response

| Endpoint | Response |
| --- | --- |
| `subscribe` | `{ accepted: true }` (cùng kết quả cho email mới và email đã có) |
| `confirm` | `{ status: "CONFIRMED" }` |
| `unsubscribe` | `{ status: "UNSUBSCRIBED" }` |
| `GET /admin/newsletter/subscribers` | `{ data: NewsletterSubscriber[], meta }` |
| `GET /admin/newsletter/subscribers/export.csv` | CSV: Email, Trạng thái, Ngày đăng ký, Ngày xác nhận, Ngày hủy |

Cột CSV theo [SUBSCRIBER_COLUMNS](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/newsletter/newsletter.service.ts#L156-L162).
