# Rendering và cache

Ứng dụng lấy dữ liệu theo hai cách: Server Component gọi API khi dựng trang, và hook TanStack Query gọi API từ trình duyệt. Trang này giải thích khi nào dùng cách nào, và mỗi client API có chính sách cache gì.

## Chọn cách lấy dữ liệu

| Loại dữ liệu | Cách lấy | Lý do | Ví dụ |
| --- | --- | --- | --- |
| Catalog công khai (danh sách, chi tiết sản phẩm, trang chủ, khuyến mãi) | Server Component gọi `src/lib/api/server.ts` | HTML có sẵn nội dung cho người dùng và công cụ tìm kiếm | [products/server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/products/server.ts) |
| Dữ liệu theo người dùng (phiên, giỏ hàng, đơn hàng, thông báo) và toàn bộ trang quản trị | Hook TanStack Query gọi `src/lib/api/client.ts` | Cần cookie của người dùng, cần làm mới và cập nhật sau thao tác | [cart/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/hooks.ts) |

## Bảng client server

Có bốn client API, tạo bằng `openapi-fetch` từ cùng một kiểu `paths`.

| Client | Chạy ở | Địa chỉ gốc | Tùy chọn fetch | Nơi dùng (đã kiểm tra trong code) |
| --- | --- | --- | --- | --- |
| `catalogServerApi` | Server | `API_ORIGIN` | `next.revalidate: 3600` | Bộ lọc sản phẩm (`/products/filters`), thông tin cửa hàng (`/store-info`) |
| `homeServerApi` | Server | `API_ORIGIN` | `next.revalidate: 60` | Banner trang chủ, đánh giá nổi bật, ảnh đại diện theo nhu cầu, thanh khuyến mãi |
| `freshServerApi` (cũng xuất là `serverApi`) | Server | `API_ORIGIN` | `cache: "no-store"` | Danh sách, facet và chi tiết sản phẩm, đánh giá, trang khuyến mãi, sản phẩm flash sale và bán chạy ở trang chủ |
| `api` | Trình duyệt | `window.location.origin` | `authFetch` (xem [Phiên đăng nhập](auth-session.md)) | Mọi hook TanStack Query |

Nguồn: [server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/server.ts#L8-L21), [client.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/client.ts#L39).

Các test trong [server-api.test.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/lib/server-api.test.ts) khẳng định ý định thiết kế: dữ liệu có giá dùng `no-store`, dữ liệu không có giá có thể cũ một phút, danh mục tĩnh có thể cũ một giờ.

> [!WARNING]
> **Chưa xác minh:** giá trị `revalidate` có thực sự có tác dụng hay không. Layout gốc đặt `dynamic = "force-dynamic"`, và tài liệu Next 16.4.2 đi kèm trong `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` mô tả `force-dynamic` là tương đương `fetchCache = 'force-no-store'`, chế độ buộc mọi `fetch` tải lại ở mỗi request kể cả khi có `force-cache`. Nếu đúng như vậy thì `3600` và `60` bị bỏ qua và mọi lời gọi từ Server Component đều tải lại. Chưa chạy thực tế để quan sát; cần kiểm tra bằng cách build, chạy `pnpm start` và đếm số request tới API.

## Trang chủ: lỗi từng khối không làm hỏng cả trang

Trang chủ gọi nhiều API song song trong `getHomeData`. Hàm `settle` bắt lỗi của từng khối, ghi log và trả giá trị dự phòng, nên một API lỗi chỉ làm ẩn khối đó. Riêng `body` ném lỗi khi HTTP không thành công mà không gọi `notFound()`, để một lỗi 404 của khối nhỏ không biến cả trang chủ thành trang "không tìm thấy" ([home/server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/home/server.ts#L21-L36)). Chân trang cũng lấy thông tin cửa hàng theo cách này: thiếu dữ liệu thì chỉ hiển thị ít hơn ([store-info/server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/store-info/server.ts)).

## Lỗi khi dựng trang

Các trang catalog khác dùng `fetchPublic`:

| Tình huống | Kết quả |
| --- | --- |
| API trả `404` | Gọi `notFound()`, người dùng thấy trang [not-found.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/not-found.tsx). |
| API lỗi khác hoặc không kết nối được | Ném `ApiError`, [error.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/error.tsx) hiển thị "Không tải được trang" kèm nút "Thử lại". |

## Cache phía trình duyệt (TanStack Query)

Cấu hình trong [Providers.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/providers/Providers.tsx#L16-L27):

| Tùy chọn | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `staleTime` | 30 giây | Dữ liệu coi là mới trong 30 giây, không tải lại khi component mount lại. |
| `refetchOnWindowFocus` | `false` | Quay lại tab không tự tải lại. |
| `retry` | Không retry khi `ApiError` có `status < 500`; tối đa 2 lần retry cho lỗi còn lại | Lỗi nghiệp vụ `4xx` không được thử lại. |

Lỗi mạng cũng không được retry: `unwrap` gói lỗi mạng thành `ApiError` với `status = 0` ([errors.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/errors.ts#L99-L105)), và `0 < 500`. Một số hook đặt `staleTime` riêng, ví dụ `useMe` dùng 60 giây ([useMe.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/account/useMe.ts)).

Quy ước query key và cách làm mới sau thao tác ở [Query keys](../06-api-and-data/query-keys.md).

## Đọc tiếp

- [Phiên đăng nhập](auth-session.md)
- [Lớp gọi API](../06-api-and-data/api-layer.md)
- [Data flow](../07-diagrams/data-flow.md)
