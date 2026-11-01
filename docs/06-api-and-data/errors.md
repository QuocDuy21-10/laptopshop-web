# Xử lý lỗi API

Lỗi từ backend được chuẩn hóa thành `ApiError` rồi chuyển thành thông báo tiếng Việt cho người dùng. Mã nằm ở [errors.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/errors.ts) và [forms.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/forms.ts).

## Các thành phần

| Hàm hoặc lớp | Việc làm |
| --- | --- |
| `ApiError` | Lỗi có `status`, `code`, `message` và `details` tùy chọn. |
| `toApiError(status, body)` | Đọc phong bì lỗi `{ error: { code, message, details } }`. Thiếu thì dùng `code = "UNKNOWN"` và `message = "HTTP <status>"`. |
| `unwrap(promise)` | Chạy lời gọi API; trả `data` khi thành công; ném `ApiError` khi lỗi. Lỗi mạng thành `ApiError(0, "NETWORK_ERROR")`. |
| `isApiError(e, code?)` | Kiểm tra `e` là `ApiError`, và tùy chọn khớp `code`. |
| `errorMessage(e)` | Trả thông báo tiếng Việt để hiển thị. |
| `fieldErrors(e)` | Với lỗi `VALIDATION_ERROR` có `details` là mảng, trả bản đồ `đường dẫn field -> message`. |
| `applyFieldErrors(err, setError)` (trong `forms.ts`) | Gắn lỗi theo field vào React Hook Form; trả `true` nếu có ít nhất một field. |

## Thứ tự `errorMessage`

1. Nếu là `ApiError` và `code` có trong bảng thông báo, dùng thông báo đó (hơn 50 mã, ví dụ `INVALID_CREDENTIALS`, `OUT_OF_STOCK`, `INVALID_STATUS_TRANSITION`).
2. Nếu chưa khớp và `status` là `429`: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
3. Nếu chưa khớp và `status >= 500`: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau."
4. Còn lại: "Đã có lỗi xảy ra. Vui lòng thử lại."

Thông báo gốc `message` của backend không bao giờ được hiển thị. Khi backend thêm mã lỗi mới, cần thêm thông báo vào bảng `MESSAGES`, nếu không người dùng chỉ thấy thông báo chung.

### Nhóm mã lỗi tiêu biểu

| Nhóm | Ví dụ mã | Gặp ở |
| --- | --- | --- |
| Mạng và xác thực | `NETWORK_ERROR`, `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `FORBIDDEN` | Đăng nhập, đăng ký |
| Đặt hàng và thanh toán | `OUT_OF_STOCK`, `CART_EMPTY`, `PAYMENT_METHOD_UNAVAILABLE`, `PAYMENT_NOT_PAYABLE`, `PAID_ORDER_CANNOT_CANCEL` | Checkout, thanh toán, hủy đơn |
| Khuyến mãi | `COUPON_CODE_TAKEN`, `FLASH_SALE_QUOTA_EXCEEDED`, `FLASH_SALE_USER_LIMIT` | Checkout, admin khuyến mãi |
| Đánh giá, yêu thích, thông báo | `REVIEW_NOT_ELIGIBLE`, `WISHLIST_LIMIT_REACHED`, `NOTIFICATION_NOT_FOUND` | Các tính năng tương ứng |
| Hậu mãi | `WARRANTY_EXPIRED`, `QUOTE_EXPIRED`, `SERVICE_REQUEST_VERSION_CONFLICT` | Hậu mãi |
| Quản trị | `INVALID_STATUS_TRANSITION`, `PRODUCT_IN_USE`, `CANNOT_DELETE_SELF`, `RECEIPT_VERSION_CONFLICT` | Admin |

Một số mã là xung đột phiên bản (`*_VERSION_CONFLICT`): thông báo yêu cầu người dùng tải lại dữ liệu.

## errorMessage, applyFieldErrors

Form dùng cả hai: lỗi theo field gắn vào ô nhập, còn lỗi chung hiển thị ở đầu form. Mẫu thật trong [RegisterForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/RegisterForm.tsx#L33):

```ts
else if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
```

Nghĩa là: nếu lỗi là lỗi kiểm tra từng field thì hiện dưới ô nhập tương ứng; nếu không thì hiện thông báo chung.

Lưu ý: `applyFieldErrors` luôn gắn thông báo cố định "Giá trị không hợp lệ" cho mỗi field bị báo, vì thông báo field từ backend là tiếng Anh (theo chú thích trong code). Trang quản trị dùng phiên bản tương đương cho Ant Design là `setServerErrors` trong [form-errors.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/form-errors.ts).

## Lỗi khi dựng trang trên server

`fetchPublic` xử lý khác: `404` gọi `notFound()`, các lỗi còn lại ném `ApiError` để [error.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/error.tsx) hiển thị. Xem [Rendering và cache](../02-architecture/rendering-and-caching.md).

## Đọc tiếp

- [Lớp gọi API](api-layer.md)
- [Trạng thái và phản hồi trên giao diện](../05-ui-ux/states-and-feedback.md)
