# Triển khai

Frontend được đóng gói thành một image Docker chạy Next.js ở chế độ `standalone`, đặt sau nginx cùng với backend. Trang này mô tả image, bộ compose mẫu và danh sách kiểm tra khi lên production.

## Image Docker

[Dockerfile](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/Dockerfile) gồm ba giai đoạn trên `node:22-alpine`:

| Giai đoạn | Việc làm |
| --- | --- |
| `deps` | Bật corepack, sao chép `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, chạy `pnpm install --frozen-lockfile` |
| `build` | Nhận build arg `API_ORIGIN`, chạy `pnpm build` |
| `runtime` | Chỉ chép `public`, `.next/standalone`, `.next/static`; chạy bằng user `node`, cổng 3000, lệnh `node server.js` |

Điểm cần nhớ:

- **`API_ORIGIN` phải có lúc build.** Rewrite `/api/v1/*` và `/images/*` được biên dịch vào bản build ([next.config.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/next.config.ts#L4-L5)). Build arg mặc định là `http://app:8080` (tên service backend trong Compose). Đổi địa chỉ phải build lại. Biến này cũng được đặt cho giai đoạn runtime vì Server Component đọc nó.
- `output: "standalone"` tạo gói gọn, không cần `node_modules` đầy đủ ở runtime.
- [.dockerignore](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/.dockerignore) loại `node_modules`, `.next`, `.git`, `docs` và `.env*`, nên tài liệu và file môi trường không vào image.

## Compose mẫu

[docker-compose.example.yml](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/docker-compose.example.yml) dựng cả hệ thống:

```bash
docker compose -f docker-compose.example.yml up -d --build
```

| Service | Nguồn | Ghi chú |
| --- | --- | --- |
| `web` | Build từ repo này | Build arg và biến runtime `API_ORIGIN: http://app:8080`; phụ thuộc `app` |
| `nginx` | `nginx:1.27-alpine` | Mở cổng 80, gắn [deploy/nginx.conf](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/deploy/nginx.conf) |
| `app`, MySQL, Redis, worker... | Từ file compose của backend, nạp bằng `include:` | Xem repo [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/docker-compose.yml) |

> [!WARNING]
> **Lệch tên thư mục:** file compose mẫu `include` đường dẫn `../nodejs-pro/docker-compose.yml` và chú thích cần `../nodejs-pro/.env`, trong khi repo backend hiện có tên `laptopshop-api`. Điều chỉnh đường dẫn cho khớp thư mục backend trên máy bạn. Cấu hình này chưa được sửa trong repo; đây là ghi chú để người triển khai biết.

Backend cần `.env` riêng với cơ sở dữ liệu, Redis và các bí mật; không mô tả ở đây ([Biến môi trường](../12-reference/env-vars.md)).

## Danh sách kiểm tra production

- [ ] Truyền `API_ORIGIN` làm **build arg** và biến runtime cho `web`.
- [ ] nginx chuyển `/api/v1/` và `/images/` **thẳng** tới Express; các route còn lại tới Next ([nginx](nginx-and-proxy.md)).
- [ ] `CORS_ORIGINS` của backend khớp origin công khai của site (mặc định `http://localhost:3000`).
- [ ] Kết thúc HTTPS ở tầng biên hoặc reverse proxy. Backend chỉ đặt cookie `Secure` khi `NODE_ENV` là `production`, nên cần HTTPS để trình duyệt gửi cookie đăng nhập.
- [ ] Bí mật chỉ cung cấp qua cấu hình môi trường triển khai, không đưa vào image hay repo.
- [ ] Kiểm tra địa chỉ callback thanh toán, lưu trữ file và tên miền theo môi trường thật (thuộc backend).
- [ ] Bật `BANK_TRANSFER_ENABLED` ở backend nếu muốn cho phép chuyển khoản; mặc định `false`.

> [!WARNING]
> **Chưa xác minh:** cấu hình HTTPS và chuyển hướng HTTP sang HTTPS. `deploy/nginx.conf` chỉ lắng nghe cổng 80, không có khối `server` cho 443 hay chứng chỉ; phần này nằm ở tầng biên không thuộc repo.

## Site tài liệu

Site tài liệu (thư mục `docs/`) được dựng và triển khai lên GitHub Pages bởi workflow [docs.yml](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/.github/workflows/docs.yml), tách biệt với image ứng dụng. Xem [CI](../09-quality/ci.md).

## Đọc tiếp

- [nginx và proxy](nginx-and-proxy.md)
- [Mô hình bảo mật](../11-security/security-model.md)
- [Runbook: API không truy cập được](runbooks/api-unreachable.md)
