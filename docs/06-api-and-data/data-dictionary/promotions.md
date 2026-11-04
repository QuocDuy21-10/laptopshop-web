# Data dictionary: Promotions

Contract dữ liệu của module [Promotions](../../04-features/promotions.md). Cách đọc ở [README](README.md). Type lấy từ `components["schemas"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L10563-L10594). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## PublicPromotion

Trả về bởi `GET /api/v1/promotions/available`; chỉ gồm mã `COUPON` công khai.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã khuyến mãi | khóa danh sách |
| `name` | `string` | Có | Không | Tên chương trình | tiêu đề thẻ |
| `description` | `string` | Có | Có | Mô tả; null thì web hiện câu mặc định | thẻ mã |
| `code` | `string` | Có | Không | Mã giảm giá | thẻ mã, nút sao chép |
| `scope` | `"ORDER" \| "PRODUCT"` | Có | Không | Áp cho cả đơn hay sản phẩm đích | không hiển thị |
| `discountKind` | `"PERCENT" \| "FIXED"` | Có | Không | Kiểu giảm | nhãn "N% giảm" hoặc số tiền |
| `discountValue` | `number` | Có | Không | Phần trăm hoặc số tiền (VND) | nhãn mức giảm |
| `minOrderValue` | `number` | Có | Không | Đơn tối thiểu; 0 là không yêu cầu | "Đơn từ ..." khi lớn hơn 0 |
| `maxDiscount` | `number` | Có | Có | Giảm tối đa; null là không giới hạn | "Giảm tối đa ..." |
| `startsAt`, `endsAt` | `string` (ISO) | Có | Không | Thời hạn | "Áp dụng đến ...", thanh khuyến mãi |

## FlashSaleAvailability

Một phần tử của `items` trong `GET /api/v1/promotions/flash-sales/availability`; response có thêm `serverTime`.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `productId`, `promotionId` | `number` | Có | Không | Sản phẩm và chương trình |
| `name` | `string` | Có | Không | Tên chương trình |
| `state` | `"SCHEDULED" \| "RUNNING"` | Có | Không | Sắp bắt đầu hay đang chạy |
| `available` | `boolean` | Có | Không | Còn mua được ít nhất một đơn vị |
| `remainingQuota` | `number` | Có | Có | Suất còn lại; null khi chương trình ẩn số suất (`showRemainingQuota` tắt) |
| `maxUnitsPerUser` | `number` | Có | Không | Tối đa mỗi người |
| `userRemainingQuota` | `number` | Không | Không | Suất còn lại của người dùng, chỉ có khi đã đăng nhập |
| `startsAt`, `endsAt` | `string` (ISO) | Có | Không | Thời hạn, dùng cho bộ đếm |

## Enum

| Enum | Giá trị | Nguồn |
| --- | --- | --- |
| Loại | `COUPON`, `AUTOMATIC`, `FLASH_SALE` | [promotions.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/promotions/promotions.schema.ts#L5) |
| Trạng thái lưu | `DRAFT`, `ACTIVE`, `PAUSED`, `ENDED` | cùng file, dòng 6 |
| Trạng thái hiệu lực | thêm `SCHEDULED`, `RUNNING`, `EXPIRED` (suy ra từ `ACTIVE` và thời gian) | [promotions.mapper.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/promotions/promotions.mapper.ts#L9-L19) |
| Kiểu giảm | `PERCENT`, `FIXED` | cùng schema, dòng 7 |
| Phạm vi mã | `ORDER`, `PRODUCT` | cùng schema, dòng 8 |
| Hành động chuyển trạng thái | `ACTIVATE`, `PAUSE`, `RESUME`, `END` | cùng schema, dòng 9 |
| Chế độ đủ điều kiện (giá) | `POTENTIAL` (hiển thị), `EXACT` (giỏ, checkout) | [promotions.types.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/promotions/promotions.types.ts#L52) |
| Lý do dự phòng Flash Sale | `GLOBAL_QUOTA`, `USER_QUOTA`, `GLOBAL_AND_USER_QUOTA` | cùng file, dòng 53 |

Nhãn trạng thái tiếng Việt ở admin: [labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/promotions/labels.ts#L1).

## Body tạo khuyến mãi (admin)

Theo [createPromotionBody](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/promotions/promotions.schema.ts#L90-L183).

| Field | Type | Bắt buộc | Ràng buộc |
| --- | --- | --- | --- |
| `kind` | enum loại | Có | |
| `name` | `string` | Có | 1 đến 150 ký tự |
| `description` | `string` | Không | tối đa 500; chuỗi rỗng coi như không có |
| `discountKind`, `discountValue` | enum, `number` | Có | nguyên dương; phần trăm tối đa 100 |
| `startsAt`, `endsAt` | ngày giờ | Có | `endsAt` sau `startsAt` |
| `coupon` | object | Với `COUPON` | `code`, `scope`, `minOrderValue`, `maxDiscount?`, `maxUses?`, `maxUsesPerUser`, `isPublic`, `targetProductIds` |
| `automatic` | object | Với `AUTOMATIC` | `priority`, `stackableWithCoupon`, `targetProductIds` (không rỗng) |
| `flashSale` | object | Với `FLASH_SALE` | `priority`, `stackableWithCoupon`, `showRemainingQuota`, `items[]` (`productId`, `totalQuota`, `maxUnitsPerUser`) |

Chỉ được có đúng khối chính sách khớp với `kind`. Tối đa 500 sản phẩm đích hoặc dòng quota.
