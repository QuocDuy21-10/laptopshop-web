# Danh sách route

Mọi trang của ứng dụng (49 route) liệt kê từ các file `page.tsx` trong [src/app](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/src/app). Bảng được dựng từ mã nguồn; khi thêm hoặc đổi route, cập nhật cả bảng này.

## Cách đọc

| Cột | Ý nghĩa |
| --- | --- |
| Cần đăng nhập | `Có` nếu route thuộc nhóm được bảo vệ trong [guarded-routes.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/guarded-routes.ts) (`/cart`, `/checkout`, `/wishlist`, `/account`, `/admin`). Việc bảo vệ gồm ba tầng, xem [Routing và bảo vệ route](../02-architecture/routing-and-guards.md). |
| Dữ liệu | `Server`: file `page.tsx` gọi API trên server (Server Component). `Client`: trang là khung, dữ liệu lấy bằng TanStack Query trong component client. Xác định theo việc `page.tsx` có gọi `server.ts` hay client server API hay không. |
| Tính năng | Liên kết tới tài liệu tính năng nếu có. Các tính năng khác chưa có tài liệu riêng ([Lộ trình](roadmap.md)). |

Layout gốc đặt `dynamic = "force-dynamic"`, nên các trang render theo từng yêu cầu ([Rendering và cache](../02-architecture/rendering-and-caching.md)). Các trang chi tiết sản phẩm, đơn hàng và thanh toán trả trang "không tìm thấy" khi `id` không hợp lệ.

## Storefront (`(storefront)`)

| Route | Tên trang | Cần đăng nhập | Dữ liệu | Tính năng | Mã nguồn |
| --- | --- | --- | --- | --- | --- |
| `/` | Trang chủ | Không | Server | Home | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/page.tsx) |
| `/account` | Hồ sơ | Có | Client | Account | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/page.tsx) |
| `/account/after-sales` | Yêu cầu hậu mãi | Có | Client | [After-sales](../04-features/after-sales.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/after-sales/page.tsx) |
| `/account/after-sales/[id]` | Chi tiết yêu cầu hậu mãi | Có | Client | [After-sales](../04-features/after-sales.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/after-sales/%5Bid%5D/page.tsx) |
| `/account/after-sales/new` | Tạo yêu cầu hậu mãi | Có | Client | [After-sales](../04-features/after-sales.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/after-sales/new/page.tsx) |
| `/account/notifications` | Thông báo | Có | Client | Notifications | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/notifications/page.tsx) |
| `/account/notifications/settings` | Cài đặt thông báo | Có | Client | Notifications | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/notifications/settings/page.tsx) |
| `/account/orders` | Đơn hàng của tôi | Có | Client | [Orders](../04-features/orders.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/orders/page.tsx) |
| `/account/orders/[id]` | Chi tiết đơn hàng | Có | Client | [Orders](../04-features/orders.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/orders/%5Bid%5D/page.tsx) |
| `/account/orders/[id]/payment` | Thanh toán đơn hàng | Có | Client | [Payments](../04-features/payments.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/orders/%5Bid%5D/payment/page.tsx) |
| `/account/warranties` | Quyền lợi bảo hành | Có | Client | [After-sales](../04-features/after-sales.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/account/warranties/page.tsx) |
| `/advisor` | Tư vấn chọn laptop | Không | Client | Advisor | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/advisor/page.tsx) |
| `/cart` | Giỏ hàng | Có | Client | [Cart](../04-features/cart.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/cart/page.tsx) |
| `/checkout` | Đặt hàng | Có | Client | [Checkout](../04-features/checkout.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/checkout/page.tsx) |
| `/compare` | So sánh laptop | Không | Client | Compare | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/compare/page.tsx) |
| `/newsletter/confirm` | Xác nhận đăng ký nhận ưu đãi | Không | Client | Newsletter | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/newsletter/confirm/page.tsx) |
| `/newsletter/unsubscribe` | Hủy đăng ký nhận ưu đãi | Không | Client | Newsletter | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/newsletter/unsubscribe/page.tsx) |
| `/products` | Danh sách laptop | Không | Server | [Products](../04-features/products.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/products/page.tsx) |
| `/products/[id]` | Chi tiết sản phẩm | Không | Server | [Products](../04-features/products.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/products/%5Bid%5D/page.tsx) |
| `/promotions` | Khuyến mãi | Không | Server | Promotions | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/promotions/page.tsx) |
| `/wishlist` | Yêu thích | Có | Client | Wishlist | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28storefront%29/wishlist/page.tsx) |

## Xác thực (`(auth)`)

| Route | Tên trang | Cần đăng nhập | Dữ liệu | Tính năng | Mã nguồn |
| --- | --- | --- | --- | --- | --- |
| `/forgot-password` | Quên mật khẩu | Không | Client | [Auth](../04-features/auth.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28auth%29/forgot-password/page.tsx) |
| `/login` | Đăng nhập | Không | Client | [Auth](../04-features/auth.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28auth%29/login/page.tsx) |
| `/register` | Đăng ký | Không | Client | [Auth](../04-features/auth.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28auth%29/register/page.tsx) |

## Quản trị (`(admin)`)

Toàn bộ route dưới `/admin` dùng chung layout có `AdminGuard`; chi tiết ở [Admin](../04-features/admin.md).

| Route | Tên trang | Cần đăng nhập | Dữ liệu | Tính năng | Mã nguồn |
| --- | --- | --- | --- | --- | --- |
| `/admin` | Tổng quan | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/page.tsx) |
| `/admin/after-sales` | Bảo hành và hậu mãi | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/after-sales/page.tsx) |
| `/admin/after-sales/[id]` | Chi tiết yêu cầu hậu mãi | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/after-sales/%5Bid%5D/page.tsx) |
| `/admin/home-banners` | Banner trang chủ | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/home-banners/page.tsx) |
| `/admin/home-banners/[id]` | Sửa banner | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/home-banners/%5Bid%5D/page.tsx) |
| `/admin/home-banners/new` | Thêm banner | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/home-banners/new/page.tsx) |
| `/admin/inventory` | Nhật ký kho | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/inventory/page.tsx) |
| `/admin/inventory/receipts` | Phiếu nhập kho | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/inventory/receipts/page.tsx) |
| `/admin/inventory/receipts/[id]` | Chi tiết phiếu nhập kho | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/inventory/receipts/%5Bid%5D/page.tsx) |
| `/admin/inventory/receipts/new` | Tạo phiếu nhập kho | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/inventory/receipts/new/page.tsx) |
| `/admin/newsletter` | Đăng ký nhận tin | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/newsletter/page.tsx) |
| `/admin/notifications` | Thông báo (vận hành) | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/notifications/page.tsx) |
| `/admin/orders` | Đơn hàng | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/orders/page.tsx) |
| `/admin/orders/[id]` | Chi tiết đơn hàng | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/orders/%5Bid%5D/page.tsx) |
| `/admin/payments` | Đối soát thanh toán | Có | Client | [Payments (admin)](../04-features/payments.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/payments/page.tsx) |
| `/admin/products` | Sản phẩm | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/products/page.tsx) |
| `/admin/products/[id]` | Sửa sản phẩm | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/products/%5Bid%5D/page.tsx) |
| `/admin/products/new` | Thêm sản phẩm | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/products/new/page.tsx) |
| `/admin/promotions` | Khuyến mãi | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/promotions/page.tsx) |
| `/admin/promotions/[id]` | Chi tiết khuyến mãi | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/promotions/%5Bid%5D/page.tsx) |
| `/admin/promotions/new` | Tạo khuyến mãi | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/promotions/new/page.tsx) |
| `/admin/reviews` | Đánh giá | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/reviews/page.tsx) |
| `/admin/reviews/[id]` | Chi tiết đánh giá | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/reviews/%5Bid%5D/page.tsx) |
| `/admin/users` | Người dùng | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/users/page.tsx) |
| `/admin/users/[id]` | Chi tiết khách hàng | Có | Client | [Admin](../04-features/admin.md) | [page.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/users/%5Bid%5D/page.tsx) |

## Đọc tiếp

- [Routing và bảo vệ route](../02-architecture/routing-and-guards.md)
- [Use case](../07-diagrams/use-cases.md)
