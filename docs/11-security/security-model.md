# Mô hình bảo mật

Trang này tổng hợp các điều kiểm soát bảo mật có trong repo frontend, ranh giới tin cậy, và những điều **không** nằm ở frontend. Nguyên tắc nền tảng: **backend là nơi quyết định mọi thứ liên quan đến danh tính, quyền, tiền và tồn kho**; frontend chỉ phục vụ trải nghiệm.

## Ranh giới tin cậy

| Thành phần | Tin cậy đến đâu | Chịu trách nhiệm |
| --- | --- | --- |
| Trình duyệt | Không tin: người dùng có thể sửa mọi thứ | Hiển thị; kiểm tra form để người dùng sửa sớm |
| Next.js (server) | Một phần: chạy mã của repo này | Render, gọi API qua `API_ORIGIN`, đặt header bảo mật, chặn route riêng tư theo cookie |
| nginx (production) | Hạ tầng | Định tuyến, chuyển `X-Forwarded-For`, giới hạn kích thước body (4 MB); HTTPS thuộc tầng biên |
| laptopshop-api | Nguồn sự thật | Xác thực, phân quyền, kiểm tra dữ liệu, giá, tồn kho, thanh toán, giới hạn tần suất |

## Kiểm soát có trong repo

### Phiên đăng nhập

- Token nằm trong cookie **HttpOnly** do backend đặt; JavaScript của frontend không đọc được. Cookie `logged_in` (không HttpOnly) chỉ là dấu hiệu, không chứa bí mật. `SameSite=Lax`, `Secure` ở production. Chi tiết ở [Phiên đăng nhập](../02-architecture/auth-session.md).
- Làm mới phiên chỉ có một đường duy nhất (`refreshSession()`, single-flight), vì backend thu hồi cả chuỗi phiên nếu thấy refresh token bị dùng lại.
- Frontend không lưu token, mật khẩu hay mã đặt lại ở `localStorage` hoặc URL.

### Phân quyền

- [proxy.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/proxy.ts) chặn `/cart`, `/checkout`, `/wishlist`, `/account/*`, `/admin/*` khi thiếu cookie `access_token`. Chỉ kiểm tra cookie có tồn tại, **không** xác thực.
- `AdminGuard` chỉ cho vai trò `ADMIN` vào giao diện quản trị. Mã nguồn ghi rõ đây là "UX only".
- Ranh giới thật: backend yêu cầu đăng nhập và vai trò `ADMIN` cho toàn bộ `/api/v1/admin/*` ([routes/index.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/routes/index.ts#L92)) và lọc dữ liệu theo `userId` của phiên cho giỏ hàng, đơn hàng.

### Chống chuyển hướng ra ngoài trang

`safeNext` chỉ nhận đường dẫn cùng site cho tham số `next` ([safe-next.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/safe-next.ts)); URL tuyệt đối, `//host` và `/\host` bị thay bằng `/`. Xem [Routing](../02-architecture/routing-and-guards.md).

### Header bảo mật

Next đặt ba header trên mọi route ([next.config.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/next.config.ts#L18-L28)), có test trong [next-config.test.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/next-config.test.ts):

| Header | Giá trị | Tác dụng |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Ngăn trình duyệt đoán kiểu nội dung |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Giới hạn thông tin gửi trong header Referer |
| `Content-Security-Policy` | `frame-ancestors 'none'` | Cấm nhúng trang vào khung (chống clickjacking) |

`poweredByHeader` được tắt nên không lộ `X-Powered-By`.

> [!NOTE]
> Chỉ có chỉ thị `frame-ancestors` trong CSP; không có chính sách nguồn nội dung đầy đủ (`default-src`, `script-src`). Đây là hiện trạng, không phải khuyến nghị. Header HSTS không thấy trong `next.config.ts` hay `deploy/nginx.conf`; HTTPS và HSTS thuộc tầng biên mà repo không cấu hình ([Triển khai](../10-operations/deployment.md)).

### Dữ liệu và nội dung

- Mô tả sản phẩm và nội dung người dùng được React hiển thị dưới dạng văn bản, không chèn HTML thô.
- Tải ảnh lên chỉ nhận JPEG hoặc PNG ở các form có tệp (kiểm tra thêm ở backend: `INVALID_FILE`).
- Frontend không tin giá do chính mình tính: tổng tiền và giảm giá đều do server trả; đặt hàng gửi kèm `pricingFingerprint` để backend phát hiện giá đã đổi ([Checkout](../04-features/checkout.md)).
- Thanh toán chuyển khoản không có đường nào để frontend tự xác nhận ([Payments](../04-features/payments.md)).

### Chống lặp thao tác

Đặt hàng, điều chỉnh tồn kho và một số thao tác hậu mãi dùng header `Idempotency-Key` để thao tác lặp (do mạng chập chờn hoặc bấm đúp) không tạo bản ghi trùng. Phiếu nhập và ca đối soát dùng `version` chống ghi đè đồng thời.

### Giới hạn tần suất

Backend giới hạn 10 yêu cầu mỗi 15 phút cho đăng nhập, đăng ký, quên và đặt lại mật khẩu ([rate-limit.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/middlewares/rate-limit.ts#L34-L41)). Bộ giới hạn cần biết IP thật của người dùng, nên ở production nginx chuyển `/api/v1/` thẳng tới Express với `X-Forwarded-For`; rewrite của Next làm mất header này ([nginx](../10-operations/nginx-and-proxy.md)).

### Cấu hình và bí mật

- Không commit `.env*`; chỉ `.env.example` được commit ([.gitignore](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/.gitignore)). Tài liệu này không chứa giá trị cấu hình thật.
- Mọi bí mật (khóa JWT, thông tin nhà cung cấp thanh toán, email) thuộc backend và được cung cấp qua môi trường triển khai.
- Biến duy nhất frontend dùng là `API_ORIGIN`, một địa chỉ, không phải bí mật ([Biến môi trường](../12-reference/env-vars.md)).
- Ant Design (CSS-in-JS) chỉ được nạp ở nhánh `/admin`.

## Những điều frontend không bảo đảm

| Điều | Ai bảo đảm |
| --- | --- |
| Người gọi có thật sự đã đăng nhập và có quyền | Backend |
| Giá, giảm giá, phí, tổng tiền đúng | Backend |
| Tồn kho không bị bán vượt | Backend (giao dịch cơ sở dữ liệu, khóa dòng) |
| Một khoản chuyển khoản là thật | Backend (webhook có xác thực, đối soát) |
| HTTPS, HSTS, chứng chỉ | Tầng biên (reverse proxy), ngoài repo |
| CORS của API | Backend, biến `CORS_ORIGINS` |

## Khuyến nghị theo dõi

Các điểm sau là hiện trạng cần cân nhắc, không phải lỗi đã xác nhận; xem thêm [Lộ trình](../12-reference/roadmap.md):

- Bổ sung CSP đầy đủ hơn `frame-ancestors`.
- Xác nhận HSTS và chuyển hướng HTTP sang HTTPS ở tầng biên.
- Xác nhận giới hạn tần suất áp dụng cho các endpoint ghi khác ngoài nhóm auth.

> [!WARNING]
> **Chưa xác minh:** cấu hình CORS và cookie ở môi trường production thật (`CORS_ORIGINS`, `COOKIE_DOMAIN`, `Secure`). Mới đọc mã backend, chưa kiểm tra triển khai thực tế.

## Đọc tiếp

- [Phiên đăng nhập](../02-architecture/auth-session.md)
- [Routing và bảo vệ route](../02-architecture/routing-and-guards.md)
- [Triển khai](../10-operations/deployment.md)
