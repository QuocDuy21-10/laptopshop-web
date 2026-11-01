# Thuật ngữ

Các thuật ngữ gặp thường xuyên trong tài liệu và mã nguồn. Cột cuối chỉ nơi bạn sẽ thấy thuật ngữ đó trong repo.

## Kỹ thuật

| Thuật ngữ | Giải thích | Gặp ở đâu |
| --- | --- | --- |
| App Router | Cách tổ chức route của Next.js dựa trên cấu trúc thư mục `app/`. | `src/app` |
| Route group | Thư mục đặt trong ngoặc, như `(storefront)`, dùng để gom route và layout mà không đổi URL. | `src/app/(storefront)`, `(auth)`, `(admin)` |
| Server Component | Thành phần React chạy trên server, gọi API trực tiếp và gửi HTML về trình duyệt. Là mặc định trong Next.js. | trang catalog |
| Client Component | Thành phần chạy trong trình duyệt, khai báo bằng `"use client"`, dùng khi cần tương tác. | form, giỏ hàng |
| TanStack Query | Thư viện lấy và lưu đệm dữ liệu phía client, tự làm tươi lại khi dữ liệu cũ. | `hooks.ts` của mỗi feature |
| Query key | Khóa nhận diện một mục trong bộ nhớ đệm của TanStack Query. | [query-keys.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/query-keys.ts) |
| Revalidate | Thời gian Next.js giữ kết quả gọi API trước khi lấy lại. | [server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/server.ts) |
| Access token | Chứng nhận ngắn hạn chứng minh người dùng đã đăng nhập, lưu trong cookie. | cookie `access_token` |
| Refresh token | Chứng nhận dài hạn hơn, dùng để xin access token mới khi hết hạn. | `/api/v1/auth/refresh` |
| Cookie HttpOnly | Cookie mà JavaScript trong trình duyệt không đọc được, giảm rủi ro bị đánh cắp token. | cookie đăng nhập |
| Single-flight refresh | Kỹ thuật chỉ cho một yêu cầu refresh chạy tại một thời điểm; các yêu cầu khác chờ kết quả đó. | `refreshSession()` |
| OpenAPI | Chuẩn mô tả API. Backend xuất ra, frontend sinh type từ đó. | `src/lib/api/schema.d.ts` |
| Rewrite | Next.js nhận một đường dẫn và chuyển tiếp sang địa chỉ khác mà trình duyệt không biết. | `/api/v1/*` trong `next.config.ts` |
| Reverse proxy | Máy chủ đứng trước ứng dụng, nhận yêu cầu rồi chuyển đến đúng dịch vụ. Ở production là nginx. | `deploy/nginx.conf` |
| Standalone build | Chế độ build của Next.js tạo ra gói chạy độc lập, gọn cho Docker. | `output: "standalone"` |
| Zod | Thư viện khai báo và kiểm tra dữ liệu, dùng cho form. | `schema.ts` trong feature |
| SCSS Module | File style Sass có phạm vi riêng cho từng component. | `*.module.scss` |
| Token (thiết kế) | Biến CSS chứa giá trị thiết kế như màu, cỡ chữ. Khác với token đăng nhập. | `src/styles/_tokens.scss` |

## Nghiệp vụ

| Thuật ngữ | Giải thích | Gặp ở đâu |
| --- | --- | --- |
| Coupon (mã giảm giá) | Mã khách nhập khi đặt hàng để được giảm giá. | trang checkout, `/promotions` |
| Flash sale | Chương trình giảm giá có thời hạn và số lượng giới hạn. | trang chủ, trang sản phẩm, admin khuyến mãi |
| Báo giá khi đặt hàng (quote) | Bảng tính giá do backend trả về trước khi đặt, gồm giảm giá và tổng tiền. | `useCheckoutQuote` |
| COD | Thanh toán khi nhận hàng. | phương thức thanh toán `COD` |
| Chuyển khoản (`BANK_TRANSFER`) | Khách chuyển tiền qua ngân hàng, thường qua mã QR. | trang thanh toán |
| Hậu mãi (after-sales) | Các dịch vụ sau khi mua: bảo hành, sửa chữa, hỗ trợ kỹ thuật. | `/account/after-sales` |
| Bảo hành (warranty) | Quyền lợi sửa hoặc đổi máy của thiết bị đã mua. | `/account/warranties` |
| Wishlist | Danh sách máy khách đã lưu để xem lại. | `/wishlist` |
| Newsletter | Email ưu đãi khách đăng ký nhận. | `/newsletter/*` |
| Idempotency key | Mã duy nhất gửi kèm yêu cầu để gửi lặp lại không tạo thêm bản ghi trùng. | ví dụ: gửi yêu cầu hậu mãi, điều chỉnh tồn kho |
