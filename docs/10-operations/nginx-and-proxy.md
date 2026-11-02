# nginx và proxy

Ở production, nginx đứng trước cả frontend và backend. Cấu hình nằm ở [deploy/nginx.conf](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/deploy/nginx.conf).

## Cấu hình từng phần

| Phần | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `listen` | `80` | Chỉ HTTP; HTTPS xử lý ở tầng biên (ngoài repo) |
| `client_max_body_size` | `4m` | Giới hạn kích thước thân yêu cầu (ảnh tải lên, tệp đính kèm) |
| `location /api/v1/` | `proxy_pass http://app:8080` | Chuyển **thẳng** tới Express. Đặt `Host`, `X-Forwarded-For` bằng `$remote_addr` và `X-Forwarded-Proto` |
| `location /images/` | `proxy_pass http://app:8080` | Ảnh sản phẩm do Express phục vụ |
| `location /` | `proxy_pass http://web:3000` | Mọi route trang tới Next.js. `X-Forwarded-For` dùng `$proxy_add_x_forwarded_for` |

## Vì sao `/api/v1/` đi thẳng tới Express

Chú thích trong cấu hình nêu lý do: rewrite của Next làm mất `X-Forwarded-For`, khiến mọi người dùng chia sẻ một IP trong bộ giới hạn tần suất của API.

Phía backend khớp với điều đó:

- `app.set("trust proxy", 1)` ([app.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/app.ts#L50)): tin một lớp proxy phía trước để lấy IP người dùng.
- Bộ giới hạn chung và bộ giới hạn nhóm auth ([rate-limit.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/middlewares/rate-limit.ts)) dùng khóa đếm mặc định của `express-rate-limit`, tức địa chỉ IP; bộ đếm lưu trong Redis khi được cấu hình.
- nginx đặt `X-Forwarded-For` bằng đúng `$remote_addr` (không nối thêm giá trị client gửi) cho `/api/v1/`, nên người dùng không giả IP bằng cách tự gửi header này.

Hệ quả: nếu cấu hình sai để `/api/v1/` đi qua Next, giới hạn tần suất sẽ coi nhiều người dùng là một IP và có thể chặn nhầm.

## So với môi trường phát triển

| | Dev (`pnpm dev`) | Production |
| --- | --- | --- |
| Ai nhận request của trình duyệt | Next.js | nginx |
| `/api/v1/*`, `/images/*` | Next rewrite sang `API_ORIGIN` | nginx chuyển thẳng tới Express |
| `X-Forwarded-For` tới API | Không đảm bảo (rewrite làm mất) | Có, do nginx đặt |

Sơ đồ ở [C4 Container](../07-diagrams/c4-container.md).

## Khi sửa cấu hình

- Thêm đường dẫn API hoặc tệp tĩnh mới của backend: thêm `location` tương ứng, nếu không request sẽ đi tới Next.
- Cần tải lên tệp lớn hơn 4 MB: tăng `client_max_body_size`; kiểm tra giới hạn kích thước ở backend.
- Thêm HTTPS: đặt ở tầng biên hoặc thêm khối `server` 443 và đặt lại `X-Forwarded-Proto` cho đúng.

> [!WARNING]
> **Chưa xác minh:** nginx không có cấu hình nén, bộ nhớ đệm hay header bảo mật riêng; các header bảo mật hiện do Next đặt ([Mô hình bảo mật](../11-security/security-model.md)).

## Đọc tiếp

- [Triển khai](deployment.md)
- [Runbook: API không truy cập được](runbooks/api-unreachable.md)
