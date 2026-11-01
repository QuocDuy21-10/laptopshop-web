# Lớp gọi API

Mọi lời gọi tới backend đi qua `openapi-fetch` với kiểu `paths` sinh từ OpenAPI, nên đường dẫn, tham số và dữ liệu trả về đều được TypeScript kiểm tra. Trang này mô tả các thành phần của lớp đó và cách dùng.

## Các thành phần

| File | Vai trò |
| --- | --- |
| [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) | Type sinh tự động (`paths`, `components`). Không sửa tay; xem [Sinh lại API types](../08-development/regenerate-api-types.md). |
| [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts) | Tên gọn cho các type, một số type được chỉnh để vài field thành tùy chọn. |
| [client.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/client.ts) | Client `api` cho trình duyệt, `authFetch`, `refreshSession`. |
| [server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/server.ts) | Client cho Server Component và `fetchPublic`. Chỉ import được từ server (`server-only`). |
| [errors.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/errors.ts) | `ApiError`, `unwrap`, `errorMessage`, `fieldErrors`. Xem [Xử lý lỗi API](errors.md). |
| [query-keys.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/query-keys.ts) | Mọi query key của TanStack Query. Xem [Query keys](query-keys.md). |
| [multipart.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/multipart.ts) | Gửi form có file (`toFormData`, `sendMultipart`). |
| [download.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/download.ts) | Tải file CSV (`downloadCsv`). |

## Mẫu một hook gọi API

Các hook trong `src/features/<module>/hooks.ts` đều theo cùng một mẫu: gọi `api.METHOD(path, ...)`, bọc bằng `unwrap`, rồi cập nhật hoặc làm mới cache.

```ts
// src/features/orders/hooks.ts
export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => (await unwrap(api.GET("/api/v1/orders/me/{id}", { params: { path: { id } } }))).data,
  });
}

export function useCancelOrder(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/orders/me/{id}/cancel", { params: { path: { id } } })),
    onSuccess: (body) => qc.setQueryData(queryKeys.order(id), body.data),
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.order(id) }),
        qc.invalidateQueries({ queryKey: queryKeys.ordersAll }),
        qc.invalidateQueries({ queryKey: queryKeys.me }),
      ]),
  });
}
```

Nguồn: [orders/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/hooks.ts#L15-L34).

Những điểm cần nhớ:

- Đường dẫn là chuỗi literal có kiểu (`"/api/v1/orders/me/{id}"`); tham số đường dẫn truyền qua `params.path`, query qua `params.query`, body qua `body`.
- Phản hồi của API thường bọc trong `{ data: ... }`, nên hook lấy `.data` (hoặc `body.data` ở mutation). Với danh sách có phân trang, phản hồi còn có `meta`, và hook trả nguyên phản hồi (ví dụ `useOrders`).
- `unwrap` ném `ApiError` khi lỗi, nên `useQuery` và `useMutation` nhận lỗi qua cơ chế lỗi chuẩn của TanStack Query.

## Hai đường gọi: trình duyệt và server

| | Trình duyệt | Server Component |
| --- | --- | --- |
| Client | `api` trong `client.ts` | `catalogServerApi`, `homeServerApi`, `freshServerApi` trong `server.ts` |
| Địa chỉ gốc | `window.location.origin` (cùng origin, đi qua rewrite hoặc nginx) | `API_ORIGIN` |
| Làm mới phiên khi `401` | Có (`authFetch`) | Không |
| Bọc kết quả | `unwrap` | `fetchPublic` (`404` thành `notFound()`); trang chủ và thông tin cửa hàng dùng cách xử lý riêng để lỗi không lan ra cả trang |
| Dùng cho | Dữ liệu theo người dùng, trang quản trị | Catalog công khai |

Chính sách cache của từng client ở [Rendering và cache](../02-architecture/rendering-and-caching.md).

## File và tải xuống

- `sendMultipart(path, method, form, headers?)` gửi `FormData` qua `authFetch` để trình duyệt tự đặt boundary, và vẫn được làm mới phiên khi `401`. `toFormData` bỏ qua giá trị `null` hoặc `undefined` để `PATCH` chỉ gửi những field form thực sự có.
- `downloadCsv(path, query)` gọi API bằng `fetch` thay vì thẻ liên kết, để token hết hạn được làm mới trước. Tên file lấy từ header `Content-Disposition`, mặc định `export.csv`.

## Quy tắc

- Không gọi `fetch` thô tới `/api/v1` trong component hay hook; dùng `api` hoặc `sendMultipart` để không bỏ qua `authFetch`.
- Không viết đường làm mới phiên thứ hai ([lý do](../02-architecture/auth-session.md#refresh-single-flight)).
- Query key chỉ lấy từ `query-keys.ts`.
- Lỗi hiển thị cho người dùng đi qua `errorMessage`; không hiển thị `message` thô của backend.
- Không đọc token trong JavaScript (cookie HttpOnly).

## Đọc tiếp

- [Xử lý lỗi API](errors.md)
- [Query keys](query-keys.md)
- [Data dictionary](data-dictionary/README.md)
