# Data dictionary: Admin

Contract dữ liệu của module [Admin](../../04-features/admin.md) thuộc phạm vi frontend, giới hạn ở: form sản phẩm, điều chỉnh tồn kho, đổi trạng thái đơn, form người dùng và vai trò. Các module admin còn lại (khuyến mãi, đánh giá, hậu mãi, banner, thông báo, bản tin) chưa có data dictionary riêng ([Lộ trình](../../12-reference/roadmap.md)). Cách đọc các cột ở [README](README.md). Cấu trúc bảng thuộc backend: xem [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## ProductFormValues (form tạo, sửa sản phẩm)

Gửi dạng `multipart/form-data` qua `POST /api/v1/admin/products` và `PATCH /api/v1/admin/products/{id}`. Nguồn: [ProductForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/products/ProductForm.tsx#L19-L43). Tiền tệ là VND, số nguyên. Cột "Validation" ghi theo form.

| Field | Type | Bắt buộc | Nullable | Validation | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- | --- | --- |
| `name` | `string` | Có | Không | không chỉ khoảng trắng, tối đa 255 | Tên sản phẩm | `Laptop mẫu 15` |
| `price` | `number` | Có | Không | số nguyên từ 1 đến 2.147.483.647 | Giá niêm yết (₫) | `25990000` |
| `quantity` | `number` | Chỉ khi tạo mới | Không | số nguyên từ 0 đến 2.147.483.647 | Tồn kho ban đầu. Khi sửa không có trong form; đổi tồn kho qua điều chỉnh | `10` |
| `factory` | `string` | Có | Không | chọn từ danh sách hãng của API | Mã hãng | `ASUS` |
| `target` | `string` | Có | Không | chọn từ danh sách nhu cầu của API | Mã nhu cầu | `GAMING` |
| `shortDesc` | `string` | Có | Không | không chỉ khoảng trắng, tối đa 255 | Mô tả ngắn | |
| `detailDesc` | `string` | Có | Không | không chỉ khoảng trắng | Mô tả chi tiết, tách đoạn bằng dòng trống | |
| `cpu` | `string` | Không | Có | tối đa 255 | Tên CPU | |
| `cpuBrand` | `string` | Phụ thuộc `cpu` | Có | bắt buộc nếu có `cpu` (theo ràng buộc phụ thuộc trong form) | Hãng CPU | `AMD` |
| `gpu` | `string` | Không | Có | tối đa 255 | Tên GPU | |
| `gpuBrand`, `gpuType` | `string` | Phụ thuộc `gpu` | Có | theo ràng buộc phụ thuộc trong form | Hãng, loại GPU | `NVIDIA`, `DEDICATED` |
| `ramGb`, `storageGb` | `number` | Không | Có | số nguyên | RAM, ổ cứng (GB) | `16`, `512` |
| `screenSizeInch` | `number` | Không | Có | số | Kích thước màn hình | `15.6` |
| `screenResolution` | `string` | Không | Có | tối đa 50 | Độ phân giải dạng văn bản | |
| `panelType` | `string` | Không | Có | chọn từ danh sách | Loại tấm nền | `IPS` |
| `refreshRateHz` | `number` | Không | Có | số | Tần số quét (Hz) | `144` |
| `batteryWh` | `number` | Không | Có | số | Pin (Wh) | `60` |
| `weightGrams` | `number` | Không | Có | số | Khối lượng (gram) | `1500` |
| `warrantyMonths` | `number` | Không | Có | số | Bảo hành (tháng) | `24` |
| `image` | tệp | Không | Có | JPEG hoặc PNG, một tệp | Ảnh sản phẩm; bỏ trống khi sửa để giữ ảnh cũ | |

Hai quy ước gửi dữ liệu ([ProductForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/products/ProductForm.tsx#L45-L58)):

- Với thông số bị bỏ trống, form gửi chuỗi rỗng (`""`) để backend xóa giá trị; `toFormData` bỏ qua `null` nên `null` sẽ để nguyên giá trị đã lưu.
- Giá trị chuỗi được cắt khoảng trắng hai đầu.

> Khoảng hợp lệ do backend quy định ([products.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/products/products.schema.ts#L146-L154)): `ramGb` 1–256, `storageGb` 1–16384, `screenSizeInch` 10–20, `refreshRateHz` 30–500, `batteryWh` 1–200, `weightGrams` 300–10000, `warrantyMonths` 0–120.

## AdjustBody (điều chỉnh tồn kho)

Body của `POST /api/v1/admin/inventory/adjustments`, kèm header `Idempotency-Key`. Nguồn: `AdjustBody` trong [inventory/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/inventory/hooks.ts#L11-L13) và form [StockAdjustModal.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/inventory/StockAdjustModal.tsx).

| Field | Type | Bắt buộc | Validation (form) | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| `productId` | `number` | Có | lấy từ sản phẩm đang chọn | Sản phẩm cần điều chỉnh | `12` |
| `delta` | `number` | Có | số nguyên khác 0, tối đa 10.000 theo giá trị tuyệt đối; với `RESTOCK` phải dương | Lượng thay đổi (dương là tăng, âm là giảm) | `5` |
| `reason` | `"RESTOCK"` hoặc `"CORRECTION"` | Có | một trong hai | "Nhập hàng" hoặc "Điều chỉnh kiểm kê" | `RESTOCK` |
| `note` | `string` | Có | không chỉ khoảng trắng, tối đa 500 | Ghi chú giải thích | `Nhập lô tháng 1` |

Mã trạng thái: `201` khi điều chỉnh mới, `200` khi khóa idempotency đã dùng (trả lại lần điều chỉnh ban đầu), `409` khi tồn kho sẽ âm hoặc khóa bị dùng lại với nội dung khác.

Khóa idempotency được giữ trong `useRef` của modal và chỉ đổi khi nội dung (`JSON.stringify(body)`) đổi; thành công thì xóa.

## Nhật ký kho: lý do biến động

| Mã | Nhãn |
| --- | --- |
| `OPENING` | Số dư đầu kỳ |
| `INITIAL` | Tồn ban đầu |
| `ORDER` | Bán hàng |
| `ORDER_CANCEL` | Huỷ đơn |
| `RESTOCK` | Nhập hàng |
| `CORRECTION` | Điều chỉnh kiểm kê |

Nguồn: [labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/inventory/labels.ts).

## ReceiptCreateBody (phiếu nhập kho)

Body của `POST /api/v1/admin/inventory/receipts`; sửa phiếu nháp dùng `PATCH /api/v1/admin/inventory/receipts/{id}` kèm `version`; hoàn tất bằng `POST .../{id}/post` với body `{ version }`.

| Field | Type | Bắt buộc | Validation (API) | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `supplierName` | `string` | Không | tối đa 255 (theo model) | Nhà cung cấp |
| `note` | `string` | Không | tối đa 500 | Ghi chú |
| `items[].productId` | `number` | Có | số nguyên dương; không trùng sản phẩm trong cùng phiếu | Sản phẩm nhập |
| `items[].quantity` | `number` | Có | số nguyên từ 1 đến 10.000 | Số lượng nhập |
| `items[].unitCost` | `number` | Không | số nguyên từ 0 đến 2.000.000.000 | Giá vốn một đơn vị |

Nguồn: [inventory-receipts.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/inventory/inventory-receipts.schema.ts#L6-L27). Phiếu có `status` là `DRAFT` hoặc `POSTED` và `version` tăng dần ([schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma#L1322-L1343)).

## Đổi trạng thái đơn hàng

Body của `PATCH /api/v1/admin/orders/{id}/status`:

| Field | Type | Bắt buộc | Validation | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| `status` | `"PENDING"`, `"SHIPPING"`, `"COMPLETED"` hoặc `"CANCELLED"` | Có | một trong bốn; chuyển hợp lệ do backend quyết định | Trạng thái đích | `SHIPPING` |

Kết quả: `200` trả đơn mới; `409` nếu chuyển không hợp lệ (`INVALID_STATUS_TRANSITION`). Hành động giao diện cho phép ở từng trạng thái xem [Admin](../../04-features/admin.md) và [State machine](../../07-diagrams/state-machines.md). Kiểu đơn dùng ở admin là `AdminOrder`, cùng các field với `Order` ([Data dictionary: Orders](orders.md)).

## Form người dùng (tạo, sửa)

Gửi `multipart/form-data` qua `POST /api/v1/admin/users` và `PATCH /api/v1/admin/users/{id}`. Nguồn: [UserFormModal.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/users/UserFormModal.tsx), kiểu trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts).

| Field | Type | Bắt buộc | Validation (form) | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `username` | `string` (email) | Có khi tạo | email hợp lệ | Email đăng nhập; chỉ nhập khi tạo |
| `password` | `string` | Có khi tạo | 8 đến 72 ký tự | Mật khẩu; chỉ nhập khi tạo |
| `fullName` | `string` | Có | không chỉ khoảng trắng, tối đa 255 | Họ tên |
| `phone` | `string` | Không | tối đa 20 | Số điện thoại |
| `address` | `string` | Không | tối đa 255 | Địa chỉ |
| `roleId` | `number` | Có | chọn từ danh sách vai trò; bị khóa khi sửa chính mình | Mã vai trò (API nhận `roleId`, danh sách trả tên vai trò) |
| `avatar` | tệp | Không | JPEG hoặc PNG | Ảnh đại diện |

Lỗi đặc thù: `CANNOT_CHANGE_OWN_ROLE`, `CANNOT_DELETE_SELF`, `USER_HAS_ORDERS` (xóa người đã có đơn bị từ chối).

## Role

Từ `GET /api/v1/admin/roles` (giữ trong cache vô thời hạn: `staleTime: Infinity`).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã vai trò, gửi trong `roleId` | `1` |
| `name` | `string` | Có | Không | Tên vai trò; giao diện so sánh với `"ADMIN"` | `ADMIN` |
| `description` | `string` | Có | Có | Mô tả; được dùng làm nhãn tiếng Việt khi có | `Quản trị viên` |

Nhãn dự phòng khi API không có mô tả: `ADMIN` là "Quản trị viên", `USER` là "Khách hàng", còn lại "Không xác định" ([roles.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/users/roles.ts)).

## Trạng thái danh sách trên URL

Trạng thái danh sách admin nằm trong query string của URL, đọc và ghi bởi `useListParams` ([useListParams.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/useListParams.ts)).

| Tham số | Kiểu | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- |
| `page` | số nguyên dương | Trang hiện tại; sai thì về 1 | Đổi bất kỳ tham số lọc nào thì `page` bị xóa (về trang 1) |
| `status`, `q`, `from`, `to` | chuỗi | Bộ lọc danh sách đơn | Các danh sách khác có tham số riêng, chưa liệt kê |

Mỗi trang có `ADMIN_PAGE_SIZE = 10` mục.
