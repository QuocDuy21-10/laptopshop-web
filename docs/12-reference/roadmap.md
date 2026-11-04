# Lộ trình tài liệu

Trang này liệt kê phần tài liệu còn thiếu, các mục chưa xác minh cần theo dõi, và các bước nâng cấp tiếp theo. Cập nhật trang này mỗi khi thêm tài liệu hoặc giải quyết một mục chưa xác minh.

## Module chưa có tài liệu riêng

Bảy module ưu tiên (Auth, Products, Cart, Checkout, Payments, Orders, Admin) đã xong. Còn 11 module; thứ tự đề xuất theo độ phức tạp và mức ảnh hưởng nghiệp vụ.

| Ưu tiên | Module | Route chính | Cần tài liệu hóa |
| --- | --- | --- | --- |
| Cao | after-sales | `/account/after-sales`, `/account/warranties` (khách); `/admin/after-sales` (admin) | Hai loại yêu cầu (`WARRANTY`, `TECHNICAL_SUPPORT`), trạng thái yêu cầu và từng thiết bị, báo giá, tin nhắn, ảnh đính kèm, xác minh bảo hành, khóa idempotency. Module lớn nhất sau admin |
| Cao | reviews | trang chi tiết sản phẩm; `/admin/reviews` | Điều kiện được đánh giá, ảnh đánh giá và đồng bộ ảnh, bình chọn hữu ích, trả lời chính thức, kiểm duyệt |
| Trung bình | wishlist | `/wishlist` | Giới hạn 100 sản phẩm, cảnh báo giá, ý định chờ đăng nhập, thông báo liên quan |
| Trung bình | promotions | `/promotions`, `/admin/promotions` | Ba loại (`COUPON`, `AUTOMATIC`, `FLASH_SALE`), trạng thái, suất flash sale, cách giá được tính |
| Trung bình | home | `/` | Các khối trang chủ, banner do admin điều khiển, cách cô lập lỗi từng khối |
| Trung bình | notifications | `/account/notifications`, `/admin/notifications` | Thông báo trong ứng dụng, cài đặt, thử lại gửi thất bại |
| Trung bình | compare | `/compare` | Chọn sản phẩm, bảng thông số, giới hạn số lượng |
| Trung bình | advisor | `/advisor` | Luồng tư vấn, giới hạn lượt dùng, vai trò của AI (bật bằng cấu hình backend) |
| Thấp | account | `/account` | Hồ sơ, ảnh đại diện, xác minh email |
| Thấp | newsletter | `/newsletter/*`, `/admin/newsletter` | Đăng ký, xác nhận, hủy; trạng thái `PENDING`, `CONFIRMED`, `UNSUBSCRIBED` |
| Thấp | store-info | chân trang | Dữ liệu cửa hàng hiển thị, xử lý khi thiếu |

Các module admin con (khuyến mãi, người dùng, đánh giá, hậu mãi, banner, thông báo, bản tin) hiện chỉ có phần tóm tắt trong [Admin](../04-features/admin.md); chi tiết nên được viết cùng module khách tương ứng.

## Mục chưa xác minh

Danh sách này gom các callout "Chưa xác minh" đang có trong tài liệu. Khi xác minh xong, xóa callout ở trang gốc và xóa dòng ở đây.

| Chủ đề | Trang | Cần kiểm tra ở đâu |
| --- | --- | --- |
| `revalidate` có tác dụng không khi layout gốc đặt `force-dynamic` | [Rendering và cache](../02-architecture/rendering-and-caching.md) | Build, `pnpm start`, đếm số request tới API |
| Dòng "Thanh toán khi nhận hàng (COD)" cố định ở trang chi tiết sản phẩm | [Products](../04-features/products.md) | Xác nhận với người phụ trách nội dung |
| `PricingQuote.lines` thiếu `productId`, `netLineTotal` trong `schema.d.ts` | [Checkout](../04-features/checkout.md) | Chạy `pnpm gen:api` |
| Thời hạn `pricingFingerprint`, quy tắc đơn tối thiểu của mã giảm giá | [Checkout](../04-features/checkout.md) | `promotion-fingerprint.ts`, `promotions.service.ts` ở backend |
| Điều kiện "đủ bằng chứng đối soát" để `VERIFYING` sang `EXPIRED` | [Payments](../04-features/payments.md), [State machine](../07-diagrams/state-machines.md) | `payment-maintenance.service.ts`, `reconciliation.service.ts` |
| Nhà cung cấp thanh toán `fake`: có QR, webhook mô phỏng không | [Payments](../04-features/payments.md), [C4 Context](../07-diagrams/c4-context.md) | `fake-payment.provider.ts` |
| Trần tổng số lượng một dòng giỏ sau nhiều lần cộng dồn | [Cart](../04-features/cart.md) | `cart.service.ts` |
| Cách hủy đơn trả kho, hoàn suất flash sale và mã giảm giá | [Orders](../04-features/orders.md) | `order-cancellation.service.ts` |
| Phản ứng giao diện và cơ chế khóa của `PASSWORD_RESET_LOCKED` | [Auth](../04-features/auth.md) | `password-reset.service.ts` |
| Hai tab làm mới phiên đồng thời có bị thu hồi không | [Runbook: phiên bị thu hồi](../10-operations/runbooks/session-revoked.md) | Tái hiện bằng hai tab và token hết hạn |
| Mô hình vai trò đầy đủ | [Admin](../04-features/admin.md) | `middlewares/require-role.ts` |
| Khoảng giá trị hợp lệ của thông số sản phẩm | [Data dictionary: Admin](../06-api-and-data/data-dictionary/admin.md) | `products.schema.ts` |
| Ý nghĩa `effectiveCatalogPrice` | [Data dictionary: Products](../06-api-and-data/data-dictionary/products.md) | Backend, `products.mapper.ts` |
| HTTPS, HSTS, chuyển hướng HTTP | [Triển khai](../10-operations/deployment.md) | Tầng biên ngoài repo |
| CORS và cookie ở môi trường thật | [Mô hình bảo mật](../11-security/security-model.md) | Cấu hình triển khai |
| Địa chỉ GitHub Pages | [CI](../09-quality/ci.md) | Bật Pages rồi mở site |

## Điểm lệch giữa tài liệu cũ và mã nguồn

Các điểm lệch tìm thấy khi viết bộ tài liệu này, với trạng thái xử lý.

| Điểm lệch | Trạng thái |
| --- | --- |
| CLAUDE.md ghi cache catalog `revalidate: 60`; thực tế `catalogServerApi` 3600, `homeServerApi` 60, `freshServerApi` `no-store` | Đã sửa trong CLAUDE.md |
| CLAUDE.md liệt kê proxy chặn `/cart`, `/checkout`, `/account/*`; thực tế còn `/wishlist` và `/admin/*` | Đã sửa trong CLAUDE.md |
| CLAUDE.md ghi backend ở `../nodejs-pro`; repo backend hiện là `laptopshop-api` | Đã sửa trong CLAUDE.md |
| CLAUDE.md ghi `applyFieldErrors` thuộc `errors.ts`; thực tế ở `src/lib/forms.ts` | Đã sửa trong CLAUDE.md |

## Bước nâng cấp tiếp theo

1. **Kiểm tra tài liệu tự động hơn trong CI.** `docs:build` đã bắt liên kết nội bộ hỏng. Còn thiếu: kiểm tra cú pháp Mermaid, kiểm tra liên kết tới mã nguồn (đường dẫn và số dòng), kiểm tra anchor, quét bí mật.
2. **Viết ADR** cho các quyết định đã có trong mã: làm mới phiên single-flight, nginx chuyển thẳng `/api/v1/` tới Express, Ant Design chỉ ở `/admin`, ý định chờ đăng nhập lưu trong `sessionStorage`, khóa idempotency khi đặt hàng. Dùng [mẫu ADR](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/docs/templates/adr.md).
3. **Viết hợp đồng API** (mẫu [api-contract](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/docs/templates/api-contract.md)) cho các endpoint phức tạp nhất: đặt hàng, báo giá, thanh toán.
4. **Giải quyết các mục chưa xác minh** ở trên, ưu tiên `force-dynamic` và `schema.d.ts` lệch.
5. **Đồng bộ với tài liệu backend.** Backend đang có bộ tài liệu riêng ở nhánh `chore/docs-foundation` (chưa vào `main`). Khi vào `main`, thay các liên kết tới mã nguồn backend bằng liên kết tới tài liệu tương ứng ở những chỗ phù hợp.
6. **Tài liệu quy trình người dùng** (hướng dẫn cho nhân viên cửa hàng) nếu cần cho nhóm không kỹ thuật.

## Đọc tiếp

- [Danh sách module](../04-features/README.md)
- [Quy ước viết tài liệu](../08-development/conventions.md)
