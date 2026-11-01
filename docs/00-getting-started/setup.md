# Cài đặt và chạy

Hướng dẫn chạy storefront và trang quản trị ở máy local. Repo này chỉ chứa frontend; dữ liệu thật đến từ backend [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api), nên backend cần chạy trước.

## Yêu cầu

| Thành phần | Phiên bản | Nguồn |
| --- | --- | --- |
| Node.js | 22 | [ci.yml](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/.github/workflows/ci.yml), [Dockerfile](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/Dockerfile) |
| pnpm | 11.24.0 | trường `packageManager` trong [package.json](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/package.json) |
| Backend `laptopshop-api` | đang chạy ở `http://localhost:8080` | xem README của backend |

Backend cần cơ sở dữ liệu và biến môi trường riêng; cách chuẩn bị nằm trong repo [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api), không lặp lại ở đây.

## Các bước

```bash
git clone https://github.com/QuocDuy21-10/laptopshop-web.git
cd laptopshop-web
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Mở `.env.local` và điền giá trị cho `API_ORIGIN`:

```dotenv
API_ORIGIN=http://localhost:8080
```

Sau đó chạy:

```bash
pnpm dev
```

Mở `http://localhost:3000`.

> [!WARNING]
> `.env.example` để `API_ORIGIN=` trống. Nếu giữ nguyên giá trị trống, server đọc ra chuỗi rỗng thay vì dùng mặc định `http://localhost:8080`, và schema trong [env.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/env.ts) từ chối giá trị này (đã kiểm tra riêng hành vi của Zod: `""` báo `Invalid URL`, còn biến không được đặt thì dùng mặc định). Hãy điền giá trị hoặc xóa dòng đó. Chưa kiểm tra toàn bộ quá trình khởi động của Next với giá trị trống.

## `API_ORIGIN` làm gì

`API_ORIGIN` là địa chỉ mà **server Next.js** dùng để gọi backend. Trình duyệt không gọi địa chỉ này; nó chỉ gọi đường dẫn cùng origin `/api/v1/*` và `/images/*`, rồi Next chuyển tiếp (rewrite) sang `API_ORIGIN` ([next.config.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/next.config.ts)). Nhờ vậy cookie đăng nhập luôn là cookie của cùng một origin.

Rewrite được biên dịch vào bản build, nên khi build cho production, `API_ORIGIN` phải có sẵn lúc build. Chi tiết ở [Triển khai](../10-operations/deployment.md).

## Lệnh thường dùng

| Lệnh | Tác dụng |
| --- | --- |
| `pnpm dev` | Chạy Next.js ở chế độ phát triển. |
| `pnpm lint`, `pnpm lint:css` | Kiểm tra ESLint và Stylelint. |
| `pnpm typecheck` | Sinh type của Next rồi chạy TypeScript. |
| `pnpm test` | Chạy Vitest một lần. |
| `pnpm build` | Build production. |
| `pnpm gen:api` | Sinh lại `schema.d.ts` từ OpenAPI ([hướng dẫn](../08-development/regenerate-api-types.md)). |
| `pnpm docs:dev` | Chạy site tài liệu này ở local. |

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân có thể | Cách xử lý |
| --- | --- | --- |
| Trang danh mục báo lỗi hoặc không có dữ liệu | Backend chưa chạy hoặc `API_ORIGIN` sai | [Runbook: API không truy cập được](../10-operations/runbooks/api-unreachable.md) |
| Vào `/cart`, `/checkout`, `/wishlist`, `/account/*` hoặc `/admin/*` bị chuyển về `/login` | Chưa có cookie `access_token` | Đăng nhập. Xem [Routing và bảo vệ route](../02-architecture/routing-and-guards.md). |
| Server báo lỗi ngay khi khởi động | `API_ORIGIN` để trống | Xem cảnh báo ở trên. |

## Đọc tiếp

- [Đóng góp lần đầu](first-contribution.md)
- [Tổng quan kiến trúc](../02-architecture/overview.md)
