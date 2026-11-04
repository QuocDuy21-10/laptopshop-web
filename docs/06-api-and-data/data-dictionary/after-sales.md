# Data dictionary: After-sales

Contract dữ liệu của module [After-sales](../../04-features/after-sales.md). Cách đọc ở [README](README.md). Type của response lấy từ `components["schemas"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) qua [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/after-sales/types.ts); bảng dưới mô tả phần web tự định nghĩa và các enum. Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## CreateServiceRequestForm

Form tạo yêu cầu, kiểm tra bằng zod ([schema.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/after-sales/schema.ts#L3-L13)).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| `type` | `"WARRANTY" \| "TECHNICAL_SUPPORT"` | Có | Không | Loại yêu cầu | |
| `subject` | `string` | Có | Không | Tiêu đề | 1 đến 200 ký tự sau khi cắt khoảng trắng |
| `previousRequestId` | `number` | Không | Không | Yêu cầu trước đó liên quan | số nguyên dương |
| `items` | `array` | Có | Không | Thiết bị cần xử lý | 1 đến 50 phần tử |
| `items[].orderDetailId` | `number` | Có | Không | Dòng đơn hàng của thiết bị | số nguyên dương |
| `items[].deviceLabel` | `string` | Có | Không | Tên thiết bị | 1 đến 100 ký tự |
| `items[].serialNumber` | `string` | Không | Không | Số serial | 1 đến 100 ký tự; không trùng trong yêu cầu (backend) |
| `items[].issueDescription` | `string` | Có | Không | Mô tả lỗi | 1 đến 5000 ký tự |

## Enum trạng thái

Nhãn hiển thị ở [labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/after-sales/labels.ts).

| Enum | Giá trị (nhãn) |
| --- | --- |
| Loại yêu cầu | `WARRANTY` (Bảo hành), `TECHNICAL_SUPPORT` (Hỗ trợ kỹ thuật) |
| Trạng thái yêu cầu (`ServiceRequestStatus`) | `SUBMITTED` (Chờ tiếp nhận), `REVIEWING` (Đang xác minh), `IN_PROGRESS` (Đang xử lý), `AWAITING_CUSTOMER` (Chờ khách phản hồi), `PARTIALLY_COMPLETED` (Hoàn tất một phần), `CLOSED` (Đã đóng) |
| Trạng thái thiết bị (`ServiceRequestItemStatus`) | `SUBMITTED`, `REVIEWING`, `APPROVED` (Đã duyệt), `AWAITING_ITEM` (Chờ gửi thiết bị), `RECEIVED` (Đã nhận thiết bị), `DIAGNOSING` (Đang kiểm tra), `AWAITING_QUOTE_DECISION` (Chờ khách duyệt báo giá), `IN_SERVICE` (Đang xử lý), `READY_FOR_RETURN` (Sẵn sàng trả máy), `RETURNED` (Đã trả thiết bị), `RESOLVED` (Chờ xác nhận), `CLOSED`, `REJECTED` (Từ chối), `CANCELLED` (Đã huỷ) |
| Quyết định xác minh bảo hành | `IN_WARRANTY`, `OUT_OF_WARRANTY`, `NO_WARRANTY`, `UNVERIFIABLE` |
| Lý do khiếu nại hoàn tất | `DEVICE_NOT_RECEIVED`, `ISSUE_PERSISTS` |
| Quyết định báo giá | `ACCEPT`, `DECLINE` |
| Loại sự kiện dòng thời gian | Nhãn có cho `REQUEST_CREATED`, `STATUS_CHANGED`, `PUBLIC_MESSAGE`, `INTERNAL_NOTE`; loại khác dùng nhãn dự phòng |

Giá trị enum trạng thái thiết bị của backend: [after-sales.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/after-sales/after-sales.schema.ts#L50-L66).
