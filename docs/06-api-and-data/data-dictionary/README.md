# Data dictionary

Data dictionary mô tả các contract dữ liệu thuộc **phạm vi frontend**: dữ liệu form, tham số URL, body gửi lên API và dữ liệu nhận về. Nó không mô tả cấu trúc cơ sở dữ liệu.

## Phạm vi

| Có trong tài liệu này | Không có (xem backend) |
| --- | --- |
| Kiểu dữ liệu form và validation Zod | Bảng, cột, khóa ngoại, index, ràng buộc cơ sở dữ liệu |
| Body, query, response của API mà frontend gọi | Logic nghiệp vụ nội bộ của backend |
| Trạng thái cục bộ (URL, `sessionStorage`, `localStorage`) | Cấu hình hạ tầng |

Cấu trúc cơ sở dữ liệu nằm trong [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma) của repo backend; mỗi trang data dictionary dẫn tới model liên quan thay vì chép lại.

## Nguồn dữ liệu

| Nguồn | Dùng để biết | File |
| --- | --- | --- |
| Type sinh từ OpenAPI | Tên field, kiểu, bắt buộc, nullable, enum | [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) (không sửa tay) |
| Type chỉnh tay | Field được làm tùy chọn, kiểu gộp | [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts) |
| Schema Zod | Validation phía form, thông báo lỗi | `schema.ts` hoặc `schemas.ts` trong từng feature |
| Hook và component | Dữ liệu dùng ở đâu trên giao diện | `hooks.ts`, các component |
| Prisma của backend | Ràng buộc cơ sở dữ liệu (chỉ để tham chiếu) | [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma) |

## Cách đọc các cột

| Cột | Ý nghĩa |
| --- | --- |
| Field | Tên trường trong JSON hoặc form |
| Type | Kiểu TypeScript hoặc JSON |
| Bắt buộc | `Có` nếu luôn xuất hiện (trong type của frontend); `Không` hoặc `Tùy chọn` nếu có thể vắng |
| Nullable | `Có` nếu giá trị có thể là `null` |
| Mặc định | Giá trị ban đầu của form hoặc giá trị API dùng khi bỏ trống |
| Validation | Quy tắc kiểm tra (Zod ở form, ràng buộc ở API) |
| Ý nghĩa | Vai trò của trường |
| Ví dụ | Giá trị minh họa hợp lệ, không dùng dữ liệu người dùng thật |
| Nguồn | Nơi định nghĩa |
| Dùng ở UI | Màn hình hoặc thành phần hiển thị trường |

Với kiểu sinh từ OpenAPI: `field?:` nghĩa là tùy chọn (không bắt buộc), `T | null` nghĩa là nullable. Hai điều này khác nhau: một trường bắt buộc vẫn có thể có giá trị `null`.

> [!NOTE]
> `types.ts` chuyển một số field giá, giảm giá và thuộc tính sản phẩm của `Product`, `CatalogProduct`, `Cart`, `Order`, `AdminOrder` thành tùy chọn. Cột "Bắt buộc" trong các trang bên dưới ghi theo type mà frontend dùng, và có ghi chú khi khác với `schema.d.ts`.

Dấu hiệu "chưa xác minh" trong bảng nghĩa là ý nghĩa hay chỗ dùng chưa được xác nhận từ mã nguồn; xem [Lộ trình](../../12-reference/roadmap.md).

## Các trang

| Module | Trang |
| --- | --- |
| Auth | [auth](auth.md) |
| Products | [products](products.md) |
| Cart | [cart](cart.md) |
| Checkout | [checkout](checkout.md) |
| Payments | [payments](payments.md) |
| Orders | [orders](orders.md) |
| Admin | [admin](admin.md) |

## Quy ước tiền tệ và thời gian

- Số tiền là VND, số nguyên, hiển thị bằng `formatVnd` ([format.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/format.ts)).
- Thời điểm là chuỗi ISO 8601 (`date-time`); hiển thị theo múi giờ `Asia/Ho_Chi_Minh` bằng `formatDate`.
- Phân trang trả về `{ data, meta }` với `meta` gồm `page`, `pageSize`, `total`, `totalPages`.
- Lỗi trả về `{ error: { code, message, details? } }` ([Xử lý lỗi API](../errors.md)).
