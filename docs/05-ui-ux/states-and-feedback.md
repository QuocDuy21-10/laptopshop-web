# Trạng thái và phản hồi

AGENTS.md yêu cầu mọi màn hình quan trọng xử lý đủ các trạng thái: đang tải, trống, lỗi, có thể thử lại. Trang này gom các mẫu đang dùng, mỗi mẫu có một ví dụ thật trong mã nguồn.

## Bảng mẫu

| Trạng thái | Thành phần | Ví dụ trong mã |
| --- | --- | --- |
| Đang tải một khối | `Skeleton` | [CartView.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/CartView/CartView.tsx#L18) |
| Đang xử lý một nút | `Button` với `loading` | [CheckoutForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/checkout/CheckoutForm/CheckoutForm.tsx#L182-L190) |
| Danh sách trống | `EmptyState` (kèm nút hành động) | [OrderList.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/OrderList/OrderList.tsx#L22-L34) |
| Lỗi tải có thể thử lại | `Alert tone="error"` kèm nút "Thử lại" | [CartView.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/CartView/CartView.tsx#L19-L28) |
| Không tìm thấy | `EmptyState` hoặc `notFound()` | [OrderDetail.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/OrderDetail/OrderDetail.tsx#L23-L36) |
| Lỗi khi dựng trang trên server | [error.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/error.tsx): "Không tải được trang" và nút "Thử lại" | cấp toàn ứng dụng |
| Lỗi theo ô nhập | `TextField` với `error` | [RegisterForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/RegisterForm.tsx#L40-L50) |
| Lỗi chung của form | `Alert` ở đầu form | [LoginForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/LoginForm.tsx#L61-L80) |
| Xác nhận thao tác nguy hiểm | `Dialog` | [CancelOrderDialog.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/CancelOrderDialog/CancelOrderDialog.tsx) |
| Kết quả ngắn của một thao tác | Toast (Sonner) | [useAddToCartAction.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/useAddToCartAction.ts#L22-L24) |

## Quy tắc

- **Lỗi quan trọng không chỉ nằm ở toast.** Toast chỉ báo kết quả ngắn; lỗi cần người dùng xử lý (không tải được giỏ, sai biểu mẫu) phải hiện cố định trên trang. Đây là yêu cầu của DESIGN.md.
- **Toast** đặt ở góc trên bên phải, có nút đóng ([Providers.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/providers/Providers.tsx#L40)).
- **Mọi thông báo lỗi đi qua `errorMessage`** ([Xử lý lỗi API](../06-api-and-data/errors.md)). Không hiển thị `message` thô của backend.
- **`role` đúng ngữ nghĩa.** `Alert` lỗi dùng `role="alert"`, các loại khác dùng `role="status"`; vùng nội dung thay đổi theo thời gian dùng `aria-live` (ví dụ màn hình thanh toán).
- **Skeleton giữ kích thước** của nội dung thật để trang không nhảy.
- **Không dựa vào màu một mình.** Trạng thái kèm chữ (huy hiệu có nhãn), không chỉ đổi màu.
- **Chuyển động tôn trọng `prefers-reduced-motion`.** Ví dụ `LoginForm` dùng `useReducedMotion` để tắt hoạt ảnh lỗi.

## Trạng thái trong trang quản trị

Trang quản trị dùng thành phần của Ant Design nên khác một chút: trạng thái tải dùng `Spin` và `Skeleton` của Ant, lỗi dùng `Alert` hoặc `Result`, kết quả thao tác dùng `message` ([AdminGuard.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/AdminGuard.tsx), [Dashboard.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/dashboard/Dashboard.tsx)). Nút phân trang trước và sau được gán nhãn truy cập tiếng Việt ([pagination.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/pagination.ts)).

## Đọc tiếp

- [UI/UX](README.md)
- [Xử lý lỗi API](../06-api-and-data/errors.md)
