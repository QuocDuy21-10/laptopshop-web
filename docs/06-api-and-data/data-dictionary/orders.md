# Data dictionary: Orders

Contract dữ liệu của module [Orders](../../04-features/orders.md) thuộc phạm vi frontend. Cách đọc các cột ở [README](README.md). Cấu trúc bảng đơn hàng trong cơ sở dữ liệu (model `Order`, `OrderDetail`, `OrderStatusHistory`) thuộc backend: xem [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma). Mọi số tiền là VND, số nguyên, do server tính và đã đóng băng lúc đặt hàng.

> [!NOTE]
> `types.ts` đổi các field giá của `Order` (`subtotalPrice`, `productDiscountAmount`, `couponEligibleSubtotal`, `couponDiscountAmount`, `couponCode`, `couponName`, `paymentRequired`) thành tùy chọn, trong khi `schema.d.ts` khai báo là bắt buộc ([types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts#L61-L82)). Cột "Bắt buộc" ghi theo type mà frontend dùng. `OrderDetail` dùng giá trị dự phòng khi chúng vắng.

## Order

Trả về bởi `GET /api/v1/orders/me`, `GET /api/v1/orders/me/{id}`, `POST /api/v1/orders` và `POST /api/v1/orders/me/{id}/cancel` (`data`). Nguồn: `components["schemas"]["Order"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts); ánh xạ ở backend: [orders.mapper.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/orders/orders.mapper.ts).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã đơn | `101` | "Đơn #101", URL |
| `status` | enum | Có | Không | `PENDING`, `SHIPPING`, `COMPLETED`, `CANCELLED` | `PENDING` | `OrderStatusBadge`, nút hủy |
| `totalPrice` | `number` | Có | Không | Tổng phải trả sau mọi giảm giá | `25990000` | "Tổng cộng" |
| `subtotalPrice` | `number` | Tùy chọn | Không | Tổng giá niêm yết | `27990000` | "Tạm tính" khi có giảm giá |
| `productDiscountAmount` | `number` | Tùy chọn | Không | Tổng giảm giá sản phẩm | `2000000` | "Ưu đãi sản phẩm" |
| `couponEligibleSubtotal` | `number` | Tùy chọn | Không | Phần tổng đủ điều kiện áp mã | | chưa xác minh chỗ hiển thị |
| `couponDiscountAmount` | `number` | Tùy chọn | Không | Số tiền mã giảm giá | `0` | "Mã giảm giá" khi lớn hơn 0 |
| `couponCode` | `string` | Tùy chọn | Có | Mã đã dùng | `GIAM10` | nhãn "Mã giảm giá GIAM10" |
| `couponName` | `string` | Tùy chọn | Có | Tên chương trình mã | | chưa xác minh chỗ hiển thị |
| `paymentRequired` | `boolean` | Tùy chọn | Không | Đơn có cần thanh toán hay không (`false` với phương thức `FREE` hoặc tổng 0) | `true` | chưa xác minh chỗ dùng |
| `paymentMethod` | `string` | Có | Không | `COD`, `BANK_TRANSFER` hoặc `FREE` (do backend tạo khi tổng bằng 0) | `BANK_TRANSFER` | dòng phương thức thanh toán, điều hướng sau khi đặt |
| `paymentStatus` | `string` | Có | Không | `PAYMENT_UNPAID`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED` | `PAYMENT_UNPAID` | `PaymentStatusBadge`, điều kiện mở đánh giá/hậu mãi |
| `paymentCancellationBlockedReason` | `"PAID"` hoặc `"VERIFYING"` | Có | Có | Lý do không cho hủy đơn chuyển khoản; `null` nếu không bị chặn | `null` | cảnh báo, ẩn nút hủy |
| `receiverName` | `string` | Có | Không | Tên người nhận lúc đặt | `Nguyễn Văn A` | khối "Người nhận" |
| `receiverAddress` | `string` | Có | Không | Địa chỉ giao hàng | | khối "Người nhận" |
| `receiverPhone` | `string` | Có | Không | Số điện thoại | | khối "Người nhận" |
| `createdAt` | `string` (date-time) | Có | Không | Thời điểm đặt | `2026-01-15T08:00:00.000Z` | "Đặt lúc ..." (múi giờ `Asia/Ho_Chi_Minh`) |
| `items` | `OrderItem[]` | Có | Không | Các dòng sản phẩm | | danh sách sản phẩm |

`paymentRequired` ở backend: `paymentMethod !== "FREE" && totalPrice > 0` ([orders.mapper.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/orders/orders.mapper.ts#L33)).

### Nhãn hiển thị

| Trường | Giá trị | Nhãn | Nguồn |
| --- | --- | --- | --- |
| `status` | `PENDING`, `SHIPPING`, `COMPLETED`, `CANCELLED` | Chờ xác nhận, Đang giao, Hoàn thành, Đã huỷ | [labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/labels.ts#L3-L8) |
| `paymentStatus` | `PAYMENT_UNPAID`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED` | Chưa thanh toán, Đã thanh toán, Thanh toán chưa hoàn tất | cùng file |

Giá trị không có trong bảng nhãn được hiển thị nguyên văn.

## OrderItem (phần tử của `items`)

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `orderDetailId` | `number` | Có | Không | Mã dòng đơn | tham số của liên kết hậu mãi (`orderDetailId`) |
| `productId` | `number` | Có | Không | Mã sản phẩm | liên kết sản phẩm, khóa danh sách |
| `name` | `string` | Có | Không | Tên sản phẩm tại thời điểm đặt | danh sách |
| `image` | `string` | Có | Có | Ảnh | chưa xác minh chỗ hiển thị |
| `price` | `number` | Có | Không | Giá niêm yết một đơn vị lúc đặt | "giá × số lượng" |
| `quantity` | `number` | Có | Không | Số lượng | danh sách, đếm số sản phẩm |
| `warrantyMonthsSnapshot` | `number` | Có | Có | Số tháng bảo hành chụp lúc đặt | hậu mãi |
| `warrantyStartAt`, `warrantyEndAt` | date-time | Có | Có | Thời gian bảo hành; backend điền khi đơn hoàn thành | hậu mãi |
| `warrantyPolicySource` | enum | Có | Không | `CHECKOUT_SNAPSHOT`, `CURRENT_PRODUCT_POLICY_BACKFILL`, `UNAVAILABLE`: nguồn chính sách bảo hành | hậu mãi |
| `coverage` | enum | Có | Không | `IN_WARRANTY`, `OUT_OF_WARRANTY`, `NO_WARRANTY`, `REQUIRES_VERIFICATION` | hậu mãi |
| `allowedRequestTypes` | `("WARRANTY" or "TECHNICAL_SUPPORT")[]` | Có | Không | Loại yêu cầu hậu mãi được phép | quyết định liên kết "Yêu cầu bảo hành", "Hỗ trợ kỹ thuật" |
| `productDiscountAmount` | `number` | Có | Không | Giảm giá sản phẩm của dòng | chưa xác minh chỗ hiển thị |
| `couponDiscountAmount` | `number` | Có | Không | Phần mã giảm giá phân bổ cho dòng | chưa xác minh chỗ hiển thị |
| `netLineTotal` | `number` | Có | Không | Tiền dòng sau mọi giảm giá | chưa xác minh chỗ hiển thị |
| `automaticPromotionId`, `automaticPromotionName` | `number`, `string` | Có | Có | Khuyến mãi tự động đã áp | chưa xác minh chỗ hiển thị |
| `promotionKind` | `"AUTOMATIC"`, `"FLASH_SALE"` hoặc `null` | Có | Có | Loại khuyến mãi áp cho dòng | huy hiệu "Flash Sale" |
| `flashSaleAllocation` | object | Có | Có | Suất flash sale đã giữ (xem bên dưới) | chưa xác minh chỗ hiển thị |

### flashSaleAllocation

| Field | Type | Ý nghĩa |
| --- | --- | --- |
| `promotionId` | `number` | Chương trình flash sale |
| `quantity` | `number` | Số suất đã giữ |
| `discountAmount` | `number` | Số tiền giảm nhờ suất đó |
| `status` | `"CLAIMED"` hoặc `"RELEASED"` | Đang giữ hoặc đã trả lại |

## Danh sách đơn

`GET /api/v1/orders/me` trả `{ data: Order[], meta: PageMeta }`; `meta` giống [PageMeta ở Products](products.md#pagemeta). Frontend gửi `page` và `pageSize` bằng 10, backend sắp xếp theo `id` giảm dần ([orders.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/orders/orders.service.ts#L317-L326)).
