# Lộ trình tài liệu

Trang này liệt kê phần tài liệu còn thiếu, các mục chưa xác minh cần theo dõi, và các bước nâng cấp tiếp theo. Cập nhật trang này mỗi khi thêm tài liệu hoặc giải quyết một mục chưa xác minh.

## Module chưa có tài liệu riêng

Mười sáu module (Auth, Products, Cart, Checkout, Payments, Orders, After-sales, Reviews, Wishlist, Promotions, Home, Notifications, Compare, Advisor, Account, Admin) đã xong. Còn 2 module; thứ tự đề xuất theo độ phức tạp và mức ảnh hưởng nghiệp vụ.

| Ưu tiên | Module | Route chính | Cần tài liệu hóa |
| --- | --- | --- | --- |
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
| Hai tab làm mới phiên đồng thời có bị thu hồi không | [Runbook: phiên bị thu hồi](../10-operations/runbooks/session-revoked.md) | Tái hiện bằng hai tab và token hết hạn |
| HTTPS, HSTS, chuyển hướng HTTP | [Triển khai](../10-operations/deployment.md) | Tầng biên ngoài repo |
| CORS và cookie ở môi trường thật | [Mô hình bảo mật](../11-security/security-model.md) | Cấu hình triển khai |

## Điểm lệch giữa tài liệu cũ và mã nguồn

Các điểm lệch tìm thấy khi viết bộ tài liệu này, với trạng thái xử lý.

| Điểm lệch | Trạng thái |
| --- | --- |
| CLAUDE.md ghi cache catalog `revalidate: 60`; thực tế `catalogServerApi` 3600, `homeServerApi` 60, `freshServerApi` `no-store` | Đã sửa trong CLAUDE.md |
| CLAUDE.md liệt kê proxy chặn `/cart`, `/checkout`, `/account/*`; thực tế còn `/wishlist` và `/admin/*` | Đã sửa trong CLAUDE.md |
| CLAUDE.md ghi backend ở `../nodejs-pro`; repo backend hiện là `laptopshop-api` | Đã sửa trong CLAUDE.md |
| CLAUDE.md ghi `applyFieldErrors` thuộc `errors.ts`; thực tế ở `src/lib/forms.ts` | Đã sửa trong CLAUDE.md |
| `docker-compose.example.yml` còn `include` `../nodejs-pro/docker-compose.yml` | Chưa sửa (cấu hình); ghi chú ở [Triển khai](../10-operations/deployment.md) |

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
