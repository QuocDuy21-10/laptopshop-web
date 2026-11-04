# Data dictionary: Account

Contract dữ liệu của module [Account](../../04-features/account.md). Cách đọc ở [README](README.md). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## Me

Trả về bởi `GET /api/v1/users/me`. Nguồn: `components["schemas"]["Me"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L10245-L10257).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã người dùng; khóa của mọi truy vấn theo người dùng | `queryKeys`, hook wishlist, thông báo, đánh giá |
| `username` | `string` | Có | Không | Email đăng nhập | ô Email (chỉ đọc) |
| `fullName` | `string` | Có | Có | Họ tên | form hồ sơ |
| `address` | `string` | Có | Có | Địa chỉ | form hồ sơ |
| `phone` | `string` | Có | Có | Số điện thoại | form hồ sơ |
| `accountType` | `string` | Có | Có | Loại tài khoản | chưa xác minh chỗ dùng |
| `avatar` | `string` | Có | Có | Đường dẫn ảnh đại diện | ảnh tròn ở form |
| `emailVerifiedAt` | `string` (ISO) | Có | Có | Thời điểm xác minh email; null là chưa xác minh | cài đặt thông báo |
| `role` | `string` | Có | Không | Vai trò (`ADMIN` hoặc `USER`) | điều hướng admin |
| `cartItemCount` | `number` | Có | Không | Số lượng trong giỏ | giỏ ở header |

## ProfileInput (form hồ sơ)

Kiểm tra bằng [profileSchema](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/account/schema.ts#L3-L10).

| Field | Type | Bắt buộc | Ràng buộc |
| --- | --- | --- | --- |
| `fullName` | `string` | Có | 1 đến 255 ký tự sau khi cắt khoảng trắng |
| `phone` | `string` | Có (có thể rỗng) | rỗng hoặc 8 đến 20 ký tự trong `0-9 + ( ) . -` và khoảng trắng |
| `address` | `string` | Có (có thể rỗng) | tối đa 255 ký tự |

Cộng thêm tệp `avatar` (PNG hoặc JPEG, tối đa 3 MB: `AVATAR_TYPES`, `MAX_AVATAR_BYTES`). Gửi dạng multipart; giá trị `null` hoặc `undefined` bị bỏ qua, chuỗi rỗng được gửi ([multipart.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/multipart.ts#L4-L8)).

Backend chỉ nhận `fullName`, `phone`, `address` (đều tùy chọn, `phone` tối đa 20 ký tự không có mẫu) ([users.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/users/users.schema.ts#L4-L8)).

## Xác minh email

| Type | Field | Ý nghĩa |
| --- | --- | --- |
| Request `confirm` | `code: string` | Đúng 6 chữ số (`^\d{6}$`), không field lạ |
| Response `request` | `{ accepted: boolean }` | Yêu cầu gửi mã đã được tiếp nhận |
| Response `confirm` | `{ verified: boolean }` | Đã xác minh |

Mã lỗi: `EMAIL_ALREADY_VERIFIED`, `EMAIL_OTP_RATE_LIMITED`, `EMAIL_OTP_INVALID`, `EMAIL_OTP_EXPIRED`, `EMAIL_OTP_LOCKED`, `EMAIL_DELIVERY_UNAVAILABLE` ([email-verification.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/email-verification/email-verification.service.ts)).
