# METHOD /path

Template mô tả một endpoint mà frontend gọi. Đặt trong trang feature hoặc data dictionary khi endpoint cần giải thích sâu hơn bảng tóm tắt.

Path và schema lấy từ `src/lib/api/schema.d.ts` (file sinh tự động, chỉ đọc). Hành vi chưa kiểm chứng thì đánh dấu `> [!WARNING]` theo quy ước trong [conventions](../08-development/conventions.md).

## Mục đích

<!-- Một câu: endpoint này phục vụ việc gì. -->

## Auth và quyền

<!-- Công khai / cần đăng nhập / cần role nào. Ghi nguồn xác nhận (controller hoặc middleware backend). -->

## Request

| Phần | Field | Type | Bắt buộc | Ghi chú |
| --- | --- | --- | --- | --- |
| path |  |  |  |  |
| query |  |  |  |  |
| body |  |  |  |  |

## Response

| Status | Body | Khi nào |
| --- | --- | --- |
| 200 |  |  |

## Lỗi

| Status | Mã lỗi | Ý nghĩa | UI xử lý |
| --- | --- | --- | --- |
|  |  |  |  |

Lỗi đi qua `errorMessage` và `applyFieldErrors` trong `src/lib/api/errors.ts`.

## Hook frontend gọi tới

<!-- Tên hook, file, query key. -->

## Nguồn

- `schema.d.ts`: key `paths["..."]`
- Backend: link file controller trên `laptopshop-api`
