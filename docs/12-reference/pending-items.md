# Việc chưa làm cần môi trường thật

Các mục dưới đây không xác minh được bằng cách đọc mã, nên vẫn còn callout "Chưa xác minh" ở trang gốc. Khi làm xong, xóa callout và xóa dòng ở đây và ở [Lộ trình](./roadmap.md).

| Chủ đề | Cần gì | Trang cần sửa |
| --- | --- | --- |
| `revalidate` có tác dụng không khi layout gốc `force-dynamic` | `pnpm build && pnpm start`, mở `/products` nhiều lần, đếm request tới API. Nếu vô tác dụng, quyết định bỏ `revalidate` hoặc bỏ `force-dynamic` (PR mã riêng) | [Rendering và cache](../02-architecture/rendering-and-caching.md) |
| Dòng "Thanh toán khi nhận hàng (COD)" cố định ở chi tiết sản phẩm | Hỏi người phụ trách nội dung; nếu sai thì sửa mã | [Products](../04-features/products.md) |
| `schema.d.ts` thiếu `productId`, `netLineTotal` trong `PricingQuote.lines` | Bật backend với `ENABLE_DOCS=true`, chạy `pnpm gen:api`, xem diff | [Checkout](../04-features/checkout.md), [Data dictionary: Checkout](../06-api-and-data/data-dictionary/checkout.md) |
| Hai tab làm mới phiên đồng thời có bị thu hồi không | Hai tab, access token hết hạn, cùng thao tác | [Runbook: phiên bị thu hồi](../10-operations/runbooks/session-revoked.md) |
| HTTPS, HSTS, chuyển hướng HTTP | Kiểm tra ở tầng biên thật (ngoài repo) | [Triển khai](../10-operations/deployment.md) |
| CORS và cookie ở production | Kiểm tra `CORS_ORIGINS`, `COOKIE_DOMAIN`, cờ `Secure` ở môi trường thật | [Mô hình bảo mật](../11-security/security-model.md) |
