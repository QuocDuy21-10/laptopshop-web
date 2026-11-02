# UI/UX

Hệ thống thiết kế của LaptopShop có tên **LaptopShop Evergreen**. Nguồn chuẩn (normative) là [DESIGN.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/DESIGN.md) ở thư mục gốc, viết bằng tiếng Anh: giá trị token trong phần YAML đầu file là sự thật, phần văn xuôi giải thích cách dùng. Trang này chỉ tóm tắt để developer biết nên đọc gì và dùng gì; **không sao chép** nội dung của DESIGN.md.

## Đọc DESIGN.md khi nào

Đọc toàn bộ DESIGN.md trước khi tạo hoặc chỉnh sửa giao diện. Các phần hay cần tra:

| Cần biết | Mục trong DESIGN.md |
| --- | --- |
| Màu, độ tương phản, ý nghĩa ngữ nghĩa của màu | Colors |
| Font, cỡ chữ, định dạng giá | Typography |
| Lưới, điểm ngắt (breakpoint), bố cục từng loại trang | Layout |
| Quy cách từng nhóm thành phần | Components |
| Cách ánh xạ token sang CSS/SCSS | Design Tokens in CSS / SCSS |
| Thuật ngữ tiếng Việt, cách xử lý enum | Content & Terminology |
| Điều nên và không nên | Do's and Don'ts |

## Nguyên tắc cần nhớ

- **Màu chỉ qua token.** Dùng biến CSS `var(--color-*)` khai báo trong [_tokens.scss](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/styles/_tokens.scss). Stylelint chặn mã hex và tên màu ở mọi nơi khác ([stylelint.config.mjs](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/stylelint.config.mjs)).
- **SCSS Modules**, mỗi component một file `.module.scss` đặt cạnh. Không dùng Tailwind, CSS-in-JS hay style inline thay cho hệ thống thiết kế. Ngoại lệ duy nhất là Ant Design ở `/admin` ([Admin](../04-features/admin.md)).
- **Giao diện bằng tiếng Việt.** Không bao giờ hiển thị khóa enum của API; ánh xạ qua bảng nhãn và dùng "Không xác định" khi gặp giá trị lạ (ví dụ [orders/labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/labels.ts)).
- **Giá bằng `formatVnd`** ([format.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/format.ts)), hoặc thành phần `Price`. Ngày giờ dùng `formatDate` (múi giờ `Asia/Ho_Chi_Minh`).
- **Dữ liệu thật.** Không tự bịa đánh giá sao, giá gạch, phần trăm giảm hay mức khan hiếm; mọi con số đến từ API.
- **Truy cập (accessibility).** Mục tiêu WCAG AA, focus nhìn thấy được, điều khiển bằng bàn phím, hỗ trợ `prefers-reduced-motion`, kiểm tra ở 320 px và phóng to 200%.

## Thành phần dùng chung

Nằm ở [src/components/ui](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/src/components/ui) và [src/components/app](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/src/components/app).

| Thành phần | Dùng khi | Biến thể, tham số chính |
| --- | --- | --- |
| `Button` | Hành động | `variant`: `primary`, `secondary`, `danger`, `ghost`; `size`: `sm`, `md`, `lg`; `fullWidth`; `loading`. `buttonClassName` cho liên kết trông như nút |
| `TextField` | Ô nhập có nhãn | `label`, `error`, `hint`, `required`, `revealable` (hiện mật khẩu) |
| `Checkbox` | Ô chọn | Dựng trên Radix Checkbox |
| `Dialog` | Hộp thoại, ngăn kéo | `variant`: `center`, `sheet`; dựng trên Radix Dialog |
| `Alert` | Thông báo tại chỗ | `tone`: `error`, `success`, `warning`, `info`; lỗi dùng `role="alert"` |
| `Badge` | Nhãn trạng thái ngắn | `tone`: `success`, `warning`, `error`, `info`, `neutral` |
| `EmptyState` | Danh sách trống, lỗi tải trang | `icon`, `title`, `description`, `action`, `as` |
| `Skeleton` | Đang tải | Khung xám giữ kích thước, ẩn với trình đọc màn hình |
| `Spinner` | Đang xử lý ngắn | `size` |
| `Pagination` | Phân trang bằng liên kết | `page`, `totalPages`, `hrefFor` |
| `Price` | Hiển thị giá | `value`, `size`: `sm`, `md`, `lg` |
| `QuantityStepper` | Chọn số lượng | `value`, `min` (mặc định 1), `max`, `onChange`, `disabled` |
| `Page`, `PageHeader` | Khung trang storefront và `h1` duy nhất | `title`, `description`, `actions`, `eyebrow` |

Quy ước xử lý các trạng thái (tải, trống, lỗi, thử lại, toast) ở [Trạng thái và phản hồi](states-and-feedback.md).

## Đọc tiếp

- [Trạng thái và phản hồi](states-and-feedback.md)
- [Quy ước](../08-development/conventions.md)
