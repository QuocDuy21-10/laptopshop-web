# Data dictionary: Payments

Contract dữ liệu của module [Payments](../../04-features/payments.md) thuộc phạm vi frontend. Cách đọc các cột ở [README](README.md). Cấu trúc bảng thanh toán trong cơ sở dữ liệu (model `Payment`, `PaymentWebhookEvent`, `PaymentReviewCase`, `PaymentReviewAction`, `PaymentProviderCheckpoint`) thuộc backend: xem [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma#L1167-L1290). Mọi số tiền là VND, số nguyên.

## Payment

Trả về bởi `GET /api/v1/orders/me/{id}/payment`. Nguồn: `components["schemas"]["Payment"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `string` | Có | Không | Mã thanh toán (UUID) | `"3f2a..."` | chống báo thành công nhiều lần |
| `orderId` | `number` | Có | Không | Đơn hàng sở hữu thanh toán | `101` | không hiển thị trực tiếp |
| `provider` | `string` | Có | Không | Nhà cung cấp thanh toán | `sepay` | không hiển thị |
| `method` | `string` | Có | Không | Phương thức; hiện là chuyển khoản | `BANK_TRANSFER` | không hiển thị |
| `status` | enum | Có | Không | `PENDING`, `VERIFYING`, `SUCCEEDED`, `EXPIRED`, `CANCELLED`, `REVIEW_REQUIRED` | `PENDING` | chọn màn hình ([state machine](../../07-diagrams/state-machines.md)) |
| `amount` | `number` | Có | Không | Số tiền phải chuyển | `25990000` | "Số tiền cần chuyển" |
| `currency` | `string` | Có | Không | Tiền tệ | `VND` | không hiển thị |
| `expiresAt` | `string` (date-time) | Có | Không | Hạn dùng mã QR | `2026-01-15T08:15:00.000Z` | đếm ngược |
| `cancelAfter` | `string` (date-time) | Có | Không | Mốc kết thúc thời gian ân hạn sau hạn QR | | phân biệt "ân hạn" với "đã quá hạn" |
| `paidAt` | `string` (date-time) | Có | Có | Thời điểm ghi nhận tiền; `null` khi chưa thanh toán | | không hiển thị |
| `serverTime` | `string` (date-time) | Có | Không | Giờ máy chủ lúc trả lời | | hiệu chỉnh đếm ngược so với giờ máy khách |
| `instructions` | `PaymentInstructions` | Có | Có | Hướng dẫn chuyển khoản; `null` khi không còn cần | | thẻ thông tin thanh toán |

Đếm ngược: `serverNow = serverTime + (thời gian trôi từ lúc nhận phản hồi)`, và `seconds = floor((expiresAt - serverNow) / 1000)`. "Ân hạn" khi `seconds <= 0` và `serverNow < cancelAfter` ([PaymentScreen.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/payments/PaymentScreen.tsx#L99-L108)).

## PaymentInstructions

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `qrImageUrl` | `string` (URI) | Có | Không | Địa chỉ ảnh mã QR; nhà cung cấp SePay dựng URL `https://vietqr.app/img?...` | thẻ ảnh QR (có xử lý `onError`) |
| `bankCode` | `string` | Có | Không | Mã ngân hàng nhận | "Ngân hàng" |
| `accountNumber` | `string` | Có | Không | Số tài khoản nhận | "Số tài khoản" kèm nút sao chép |
| `accountName` | `string` | Có | Không | Tên chủ tài khoản | "Chủ tài khoản" |
| `transferCode` | `string` | Có | Không | Nội dung chuyển khoản để đối soát | "Nội dung chuyển khoản" kèm nút sao chép |

Ví dụ giá trị cụ thể không được ghi ở đây vì là thông tin tài khoản thật do backend cấu hình.

## PaymentEvent (giao dịch bất thường, admin)

Từ `GET /api/v1/admin/payment-events`. Nguồn: `components["schemas"]["PaymentEvent"]`.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `id` | `string` | Có | Không | Mã sự kiện |
| `provider`, `source` | `string` | Có | Không | Nhà cung cấp và nguồn nhận (webhook hoặc đối soát) |
| `providerEventId`, `providerTransactionKey` | `string` | Có | Không | Khóa nhận diện giao dịch ở nhà cung cấp, dùng để loại trùng |
| `paymentId` | `string` | Có | Có | Thanh toán được đối chiếu tới; `null` nếu không tìm thấy |
| `direction` | `string` | Có | Không | Chiều giao dịch; chỉ chiều vào mới có thể khớp |
| `amount`, `currency` | `number`, `string` | Có | Không | Số tiền và tiền tệ của giao dịch |
| `transferCode` | `string` | Có | Có | Nội dung chuyển khoản trong giao dịch |
| `accountNumber` | `string` | Có | Có | Tài khoản nhận trong giao dịch |
| `occurredAt` | date-time | Có | Có | Thời điểm giao dịch |
| `status` | `string` | Có | Không | `MATCHED`, `REVIEW_REQUIRED`, `RESOLVED` |
| `reviewReason` | `string` | Có | Có | Lý do cần xem xét (xem bảng bên dưới) |
| `note` | `string` | Có | Có | Ghi chú của admin khi xử lý |
| `receivedAt` | date-time | Có | Không | Lúc hệ thống nhận |
| `resolvedAt`, `resolvedById` | date-time, `number` | Có | Có | Lúc và người xử lý |

Nhãn trạng thái ở UI: `MATCHED` là "Đã khớp đơn", `REVIEW_REQUIRED` là "Cần xem xét", `RESOLVED` là "Đã xử lý" ([labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/payments/labels.ts#L1-L5)).

## PaymentReviewCase (đơn chờ xác minh, admin)

Từ `GET /api/v1/admin/payment-review-cases`. Nguồn: `components["schemas"]["PaymentReviewCase"]`.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `id` | `string` | Có | Không | Mã ca |
| `paymentId` | `string` | Có | Không | Thanh toán liên quan |
| `reason` | `string` | Có | Không | Lý do mở ca; backend tạo `RECONCILIATION_INCONCLUSIVE` khi quá hạn đối soát |
| `status` | `"OPEN"` hoặc `"RESOLVED"` | Có | Không | "Đang mở" hoặc "Đã xử lý" |
| `version` | `number` | Có | Không | Số phiên bản để chống xung đột; phải gửi lại khi gia hạn hoặc giải phóng |
| `openedAt` | date-time | Có | Không | Lúc mở ca ("Mở lúc") |
| `nextReviewAt` | date-time | Có | Có | Thời điểm xem xét kế tiếp |
| `resolvedAt`, `resolution` | date-time, `string` | Có | Có | Lúc và kết quả xử lý |
| `payment` | object | Có | Không | Tóm tắt thanh toán: `id`, `orderId`, `status`, `amount`, `transferCode`, `expiresAt`, `reviewAfter`, `order` (`status`, `paymentMethod`, `paymentStatus`) |

### Body các thao tác xử lý

| Request | Field | Type | Bắt buộc | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `POST /api/v1/admin/payment-events/{id}/resolve` | `note` | `string` | Có | Ghi chú đã xử lý |
| `POST /api/v1/admin/payment-review-cases/{id}/extend` | `note` | `string` | Có | Lý do gia hạn |
| | `holdUntil` | `string` (thời điểm) | Có | Thời điểm giữ đơn tới |
| | `version` | `number` | Có | Phiên bản ca đang xem |
| `POST /api/v1/admin/payment-review-cases/{id}/release` | `note` | `string` | Có | Lý do giải phóng |
| | `confirmation` | `"RELEASE_STOCK"` | Có | Xác nhận rõ ràng rằng đơn bị hủy và trả hàng về kho |
| | `version` | `number` | Có | Phiên bản ca đang xem |

Nguồn: [admin/payments/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/payments/hooks.ts#L21-L53). Giải phóng ca hủy đơn qua `cancelOrder` với `allowVerificationCancel` ([payment-review.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/payments/payment-review.service.ts#L95-L125)).

## Mã lý do xem xét

Từ `PAYMENT_REVIEW_REASON` ở backend ([payment-status.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/payments/payment-status.ts#L16-L24)) và logic [payment-reconcile.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/payments/payment-reconcile.ts#L21-L32).

| Mã | Khi nào | Nhãn ở UI admin |
| --- | --- | --- |
| `OUTBOUND` | Giao dịch không phải chiều vào | "Giao dịch chuyển ra" |
| `UNKNOWN_CODE` | Mã chuyển khoản không khớp thanh toán nào | "Không tìm thấy mã đơn" |
| `WRONG_ACCOUNT` | Sai số tài khoản nhận | hiển thị nguyên mã |
| `AMOUNT_MISMATCH` | Sai số tiền hoặc tiền tệ | "Sai số tiền" |
| `LATE_PAYMENT` | Giao dịch đến sau hạn QR | hiển thị nguyên mã |
| `INVALID_PAYMENT_STATE` | Thanh toán không còn ở trạng thái chờ | "Trạng thái thanh toán không hợp lệ" |
| `PROVIDER_MISMATCH` | Nhà cung cấp hoặc chế độ không trùng | hiển thị nguyên mã |
| `RECONCILIATION_INCONCLUSIVE` | Đối soát chưa kết luận khi quá hạn xem xét (backend tạo cho ca) | hiển thị nguyên mã |

## PaymentMethodOption

Xem [Data dictionary: Checkout](checkout.md#paymentmethodoption).
