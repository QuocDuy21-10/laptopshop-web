# Data dictionary: Reviews

Contract dữ liệu của module [Reviews](../../04-features/reviews.md). Cách đọc ở [README](README.md). Type response lấy từ [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts#L151-L168) (đóng gói `components["schemas"]` của `schema.d.ts`). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## ReviewInput / ReviewFormInput

Form viết đánh giá, kiểm tra bằng zod ([schema.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/reviews/schema.ts#L6-L35)).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| `rating` | `number` (form: chuỗi `"1"` đến `"5"`) | Có | Không | Số sao | nguyên 1 đến 5 |
| `title` | `string` | Không | Không | Tiêu đề | tối đa 150 ký tự sau khi cắt khoảng trắng |
| `content` | `string` | Có | Không | Nội dung | 10 đến 1500 ký tự |
| `isAnonymous` | `boolean` (form: `"true"` hoặc `"false"`) | Có | Không | Ẩn tên người viết | người chưa đặt họ tên mà chọn công khai bị API từ chối |

Form dùng chuỗi cho `rating` và `isAnonymous` (nút radio) rồi `transform` sang `number` và `boolean`.

## Enum

| Enum | Giá trị | Nguồn |
| --- | --- | --- |
| Trạng thái đánh giá | `PUBLISHED`, `HIDDEN` | [reviews.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/reviews/reviews.schema.ts#L62-L74) |
| Sắp xếp danh sách | `newest`, `highest`, `lowest` | [reviews.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/reviews/reviews.schema.ts#L8) |
| Lý do không đủ điều kiện | `NOT_PURCHASED`, `ORDER_NOT_COMPLETED`, `PAYMENT_NOT_CONFIRMED`, `ALREADY_REVIEWED` | [reviews.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/reviews/reviews.service.ts#L100-L158) |

## Manifest đồng bộ ảnh

Gửi trong trường `manifest` của `PUT /reviews/{id}/images/sync` ([hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/reviews/hooks.ts#L97-L121)).

| Field | Type | Bắt buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `expectedVersion` | `number` | Có | Phiên bản bộ ảnh mà client đang thấy; lệch thì `REVIEW_IMAGE_VERSION_CONFLICT` |
| `items[].kind` | `"existing" \| "new"` | Có | Ảnh đã có hay ảnh mới |
| `items[].clientId` | `string` | Có | Mã phía client để ghép kết quả |
| `items[].imageId` | `number` | Với `existing` | Mã ảnh đã lưu |
| `items[].fileIndex` | `number` | Với `new` | Vị trí file trong danh sách `files` của multipart |

Thứ tự `items` là thứ tự ảnh mong muốn. Tối đa 3 ảnh, 3 MB mỗi ảnh.
