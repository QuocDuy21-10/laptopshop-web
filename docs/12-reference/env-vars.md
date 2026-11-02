# Biến môi trường

Frontend chỉ dùng **một** biến môi trường tự định nghĩa: `API_ORIGIN`. Các biến khác trong bảng là biến của Docker, Next.js hoặc công cụ. Tài liệu này không chứa giá trị cấu hình thật; không đọc hay commit `.env*` (trừ `.env.example`).

## Bảng biến

| Biến | Dùng ở | Lúc nào | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `API_ORIGIN` | [next.config.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/next.config.ts#L5), [env.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/env.ts), [Dockerfile](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/Dockerfile#L9-L12) | **Lúc build** (rewrite) và **lúc chạy** (Server Component) | `http://localhost:8080` khi biến không được đặt; trong Docker, build arg mặc định `http://app:8080` | Địa chỉ backend mà server Next dùng để gọi API và để rewrite `/api/v1/*`, `/images/*` |
| `OPENAPI_URL` | script `gen:api` trong [package.json](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/package.json) | Khi chạy `pnpm gen:api` | `http://localhost:8080/api-docs.json` | Địa chỉ tài liệu OpenAPI để sinh `schema.d.ts` |
| `NEXT_TELEMETRY_DISABLED` | [Dockerfile](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/Dockerfile) | Build và chạy trong Docker | `1` | Tắt gửi dữ liệu sử dụng của Next.js |
| `NODE_ENV` | Dockerfile (giai đoạn runtime) | Chạy trong Docker | `production` | Chế độ chạy |
| `PORT` | Dockerfile (runtime) | Chạy trong Docker | `3000` | Cổng lắng nghe của Next |
| `HOSTNAME` | Dockerfile (runtime) | Chạy trong Docker | `0.0.0.0` | Địa chỉ lắng nghe của Next |

`.env.example` chỉ khai báo `API_ORIGIN` (bỏ trống) kèm chú thích. Sao chép thành `.env.local` để chạy local ([Cài đặt](../00-getting-started/setup.md)).

## `API_ORIGIN` chi tiết

### Hai nơi đọc biến

1. **Lúc build:** `next.config.ts` đọc `process.env.API_ORIGIN ?? "http://localhost:8080"` rồi biên dịch giá trị vào các rewrite. Vì thế khi build Docker, `API_ORIGIN` phải được truyền qua `--build-arg`.
2. **Lúc chạy:** `src/lib/env.ts` kiểm tra biến bằng Zod (`z.url().default("http://localhost:8080")`) và Server Component dùng giá trị này để gọi API.

### Điều dễ gây lỗi

- Đổi `API_ORIGIN` ở runtime **không** đổi rewrite đã biên dịch; phải build lại ([runbook](../10-operations/runbooks/api-unreachable.md)).
- Chuỗi rỗng khác với "không đặt". Zod `z.url().default(...)` chỉ dùng mặc định khi biến là `undefined`, còn chuỗi rỗng bị từ chối (`Invalid URL`; đã thử riêng hành vi của Zod). Vì `.env.example` để `API_ORIGIN=` trống, cần điền giá trị hoặc xóa dòng khi tạo `.env.local`.
- Với `next.config.ts`, toán tử `??` cũng không thay chuỗi rỗng bằng mặc định, nên chuỗi rỗng cho ra điểm đến rewrite không hợp lệ. Suy ra từ mã, chưa chạy thử.
- Trình duyệt **không** dùng `API_ORIGIN`; nó gọi cùng origin `/api/v1/*` ([API layer](../06-api-and-data/api-layer.md)).

> [!NOTE]
> Repo không dùng biến có tiền tố `NEXT_PUBLIC_`, nên không có biến môi trường nào được nhúng vào mã gửi cho trình duyệt.

## Biến thuộc backend

Cấu hình cơ sở dữ liệu, Redis, JWT, email, nhà cung cấp thanh toán, lưu trữ file, CORS và cookie thuộc `laptopshop-api`, không phải repo này. Danh sách đầy đủ nằm ở [env.ts của backend](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/config/env.ts). Hai biến ảnh hưởng trực tiếp tới frontend:

| Biến backend | Ảnh hưởng tới frontend |
| --- | --- |
| `CORS_ORIGINS` | Phải khớp với origin công khai của site ([Triển khai](../10-operations/deployment.md)) |
| `ENABLE_DOCS` | Phải bật (`true`) khi chạy `pnpm gen:api`; mặc định `false` ([Sinh lại API types](../08-development/regenerate-api-types.md)) |

## Đọc tiếp

- [Cài đặt và chạy](../00-getting-started/setup.md)
- [Triển khai](../10-operations/deployment.md)
