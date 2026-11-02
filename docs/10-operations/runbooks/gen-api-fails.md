# Runbook: `pnpm gen:api` thất bại

## Triệu chứng

`pnpm gen:api` báo lỗi khi tải hoặc đọc tài liệu OpenAPI, và `src/lib/api/schema.d.ts` không được cập nhật.

## Ảnh hưởng

Type của frontend không theo kịp hợp đồng API, nên lỗi lệch dữ liệu chỉ xuất hiện lúc chạy thay vì lúc `typecheck`.

## Chẩn đoán

1. **Tài liệu OpenAPI có truy cập được không?** Lệnh dùng `OPENAPI_URL`, mặc định `http://localhost:8080/api-docs.json`:

   ```bash
   curl -i "${OPENAPI_URL:-http://localhost:8080/api-docs.json}"
   ```

   Kết quả mong đợi: HTTP 200 và JSON bắt đầu bằng `"openapi"`.

2. **Backend đã bật tài liệu chưa?** Route `/api-docs.json` chỉ được đăng ký khi biến `ENABLE_DOCS` của backend là `true`; mặc định là `false` ([openapi.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/docs/openapi.ts#L3056-L3061), [env.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/config/env.ts)). Nếu bước 1 trả `404`, nhiều khả năng đây là nguyên nhân.

3. **Backend có đang chạy không?** `curl -i http://localhost:8080/healthz` phải trả 200 ([API không truy cập được](api-unreachable.md)).

4. **Đúng địa chỉ chưa?** Nếu backend chạy ở cổng hoặc máy khác, đặt `OPENAPI_URL`.

## Khắc phục

| Nguyên nhân | Cách sửa |
| --- | --- |
| `ENABLE_DOCS` chưa bật | Khởi động backend với `ENABLE_DOCS=true` |
| Backend không chạy | Khởi động backend |
| Sai địa chỉ | `OPENAPI_URL=http://... pnpm gen:api` |

Sau khi sinh lại: chạy `pnpm typecheck` để thấy chỗ cần cập nhật, rồi commit `schema.d.ts` ([Sinh lại API types](../../08-development/regenerate-api-types.md)). Không sửa tay file này.

## Phòng ngừa

- Bật `ENABLE_DOCS` ở môi trường phát triển của backend.
- Chạy `pnpm gen:api` mỗi khi hợp đồng API đổi.

## Liên quan

- [Sinh lại API types](../../08-development/regenerate-api-types.md)
- [Biến môi trường](../../12-reference/env-vars.md)
