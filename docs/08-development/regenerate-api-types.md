# Sinh lại API types

Frontend dùng type được sinh tự động từ tài liệu OpenAPI của backend, nên lệnh `pnpm gen:api` là bước bắt buộc mỗi khi hợp đồng API thay đổi.

## Các file liên quan

| File | Vai trò | Có được sửa tay không |
| --- | --- | --- |
| [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) | Type sinh ra (`paths`, `components`) từ OpenAPI. | Không. Chạy `pnpm gen:api` để cập nhật. |
| [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts) | Alias đặt tên cho type trong `schema.d.ts`, cùng một số type được chỉnh tay. | Có. |

`types.ts` phần lớn chỉ đặt tên lại, nhưng với một số type (`Product`, `CatalogProduct`, `Cart`, `Order`, `AdminOrder`...) file dùng `Omit` và `Partial` để chuyển một số field về giá, giảm giá, coupon và thuộc tính sản phẩm thành tùy chọn. Vì vậy khi viết [data dictionary](../06-api-and-data/data-dictionary/README.md), phải đọc cả `schema.d.ts` lẫn `types.ts`.

## Các bước

1. Chạy backend `laptopshop-api` với biến `ENABLE_DOCS=true`. Biến này mặc định là `false`; khi tắt, backend không đăng ký route `/api-docs.json` ([openapi.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/docs/openapi.ts), [env.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/config/env.ts)).
2. Sinh lại file:

   ```bash
   pnpm gen:api
   ```

   Lệnh đọc `OPENAPI_URL` (mặc định `http://localhost:8080/api-docs.json`), ghi `src/lib/api/schema.d.ts` rồi chạy Prettier trên file đó. Để trỏ tới backend khác:

   ```bash
   OPENAPI_URL=http://localhost:8080/api-docs.json pnpm gen:api
   ```

3. Chạy `pnpm typecheck`. Lỗi type xuất hiện ở đây chính là những chỗ frontend cần cập nhật theo hợp đồng mới.
4. Commit `src/lib/api/schema.d.ts` cùng các thay đổi frontend liên quan.

Nếu lệnh thất bại, xem runbook [gen:api thất bại](../10-operations/runbooks/gen-api-fails.md).

## Đọc tiếp

- [Lớp gọi API](../06-api-and-data/api-layer.md)
- [Quy trình làm việc](workflow.md)
