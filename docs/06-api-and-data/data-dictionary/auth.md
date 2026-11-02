# Data dictionary: Auth

Các contract dữ liệu của module [Auth](../../04-features/auth.md) thuộc phạm vi frontend: dữ liệu form, body gửi lên API và dữ liệu người dùng nhận về. Cách đọc các cột ở [README](README.md). Cấu trúc bảng người dùng trong cơ sở dữ liệu thuộc backend, xem model `User` trong [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## LoginInput

Form đăng nhập. Nguồn: [schemas.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/schemas.ts#L3-L7). Gửi nguyên làm body của `POST /api/v1/auth/login`.

| Field | Type | Bắt buộc | Nullable | Mặc định | Validation | Ý nghĩa | Ví dụ | Nguồn | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `username` | `string` | Có | Không | `""` | cắt khoảng trắng, đúng định dạng email ("Email không hợp lệ") | Email đăng nhập (backend gọi là `username`) | `khach@example.com` | Zod `loginSchema` | `LoginForm` |
| `password` | `string` | Có | Không | `""` | 1 đến 72 ký tự | Mật khẩu | (không ghi mẫu) | Zod `loginSchema` | `LoginForm` |

Backend chỉ yêu cầu `username` không rỗng, tối đa 255 ký tự ([auth.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/auth/auth.schema.ts)).

## RegisterInput

Form đăng ký. Nguồn: [schemas.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/schemas.ts#L9-L19). Body của `POST /api/v1/auth/register`.

| Field | Type | Bắt buộc | Nullable | Mặc định | Validation | Ý nghĩa | Ví dụ | Nguồn | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fullName` | `string` | Có | Không | `""` | cắt khoảng trắng, 1 đến 255 ký tự | Họ tên hiển thị | `Nguyễn Văn A` | Zod `registerSchema` | `RegisterForm` |
| `username` | `string` | Có | Không | `""` | email hợp lệ, tối đa 255 | Email, dùng để đăng nhập | `khach@example.com` | Zod `registerSchema` | `RegisterForm` |
| `password` | `string` | Có | Không | `""` | 8 đến 72 ký tự | Mật khẩu mới | (không ghi mẫu) | Zod `registerSchema` | `RegisterForm` |
| `confirmPassword` | `string` | Có | Không | `""` | không rỗng; phải bằng `password` ("Mật khẩu xác nhận không khớp") | Nhập lại mật khẩu | (không ghi mẫu) | Zod `registerSchema` | `RegisterForm` |

API trả `409` mã `EMAIL_TAKEN` khi email đã đăng ký; form gắn lỗi này vào ô `username`.

## ForgotPasswordInput

Bước 1 của quên mật khẩu. Nguồn: [schemas.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/schemas.ts#L20-L23). Body của `POST /api/v1/auth/forgot-password`.

| Field | Type | Bắt buộc | Nullable | Mặc định | Validation | Ý nghĩa | Ví dụ | Nguồn | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `username` | `string` | Có | Không | `""` | email hợp lệ, tối đa 255 | Email nhận mã đặt lại | `khach@example.com` | Zod `forgotPasswordSchema` | `ForgotPasswordFlow` (bước 1) |

## ResetPasswordInput

Bước 2. Nguồn: [schemas.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/schemas.ts#L25-L35). Body của `POST /api/v1/auth/reset-password` gồm các field dưới đây cộng `username` (lấy từ bước 1, không nhập lại).

| Field | Type | Bắt buộc | Nullable | Mặc định | Validation | Ý nghĩa | Ví dụ | Nguồn | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `code` | `string` | Có | Không | `""` | đúng 6 chữ số ("Mã gồm 6 chữ số") | Mã gửi qua email, hiệu lực 15 phút | `123456` | Zod `resetPasswordSchema` | `ForgotPasswordFlow` (bước 2) |
| `password` | `string` | Có | Không | `""` | 8 đến 72 ký tự | Mật khẩu mới | (không ghi mẫu) | Zod `resetPasswordSchema` | bước 2 |
| `confirmPassword` | `string` | Có | Không | `""` | không rỗng; phải bằng `password` | Nhập lại mật khẩu mới | (không ghi mẫu) | Zod `resetPasswordSchema` | bước 2 |

## User

Người dùng trả về khi đăng ký (`data.user`). Nguồn: `components["schemas"]["User"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) (type `User` trong [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts)).

| Field | Type | Bắt buộc | Nullable | Mặc định | Validation | Ý nghĩa | Ví dụ | Nguồn | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | không | do API | Mã người dùng | `1` | schema.d.ts | khóa cache theo người dùng |
| `username` | `string` | Có | Không | không | do API | Email đăng nhập | `khach@example.com` | schema.d.ts | menu tài khoản |
| `fullName` | `string` | Có | Có | không | do API | Họ tên | `Nguyễn Văn A` | schema.d.ts | hồ sơ |
| `address` | `string` | Có | Có | không | do API | Địa chỉ | không ghi mẫu | schema.d.ts | hồ sơ, checkout |
| `phone` | `string` | Có | Có | không | do API | Số điện thoại | không ghi mẫu | schema.d.ts | hồ sơ, checkout |
| `accountType` | `string` | Có | Có | không | do API | Loại tài khoản | chưa xác minh | schema.d.ts | chưa xác minh |
| `avatar` | `string` | Có | Có | không | do API | Đường dẫn ảnh đại diện | chưa xác minh | schema.d.ts | hồ sơ |
| `emailVerifiedAt` | `string` (date-time) | Có | Có | không | do API | Thời điểm xác minh email; `null` nếu chưa | `2026-01-15T08:00:00.000Z` | schema.d.ts | hồ sơ |
| `role` | `string` | Có | Không | không | do API | Vai trò; `AdminGuard` so sánh với `"ADMIN"` | `ADMIN` | schema.d.ts | `AdminGuard` |

## Me

Người dùng hiện tại trả về bởi `GET /api/v1/users/me`, giữ trong cache khóa `me` ([useMe.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/account/useMe.ts)). `Me` gồm đúng các field của `User` ở trên, cộng thêm `cartItemCount`.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `cartItemCount` | `number` | Có | Không | Số mặt hàng trong giỏ | Biểu tượng giỏ hàng; các mutation giỏ hàng làm mới khóa `me` để cập nhật |

`useMe` trả `null` (không phải lỗi) khi khách chưa đăng nhập hoặc API trả `401`.

## Error (phong bì lỗi)

Mọi endpoint auth trả lỗi theo dạng này. Nguồn: `components["schemas"]["Error"]`, được đọc bởi [`toApiError`](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/errors.ts#L15-L18).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `error.code` | `string` | Có | Không | Mã lỗi ổn định, ví dụ `INVALID_CREDENTIALS` | `errorMessage` chọn thông báo theo mã này |
| `error.message` | `string` | Có | Không | Mô tả tiếng Anh của backend | không hiển thị cho người dùng |
| `error.details` | `unknown` | Không | Không | Với `VALIDATION_ERROR`: mảng `{ path, message }` | `applyFieldErrors` |

## Phiên đăng nhập (cookie)

Không phải dữ liệu JSON nhưng là một phần của contract: `access_token`, `refresh_token` (HttpOnly) và `logged_in`. Xem [Phiên đăng nhập](../../02-architecture/auth-session.md).
