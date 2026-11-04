# Data dictionary: Wishlist

Contract dữ liệu của module [Wishlist](../../04-features/wishlist.md). Cách đọc ở [README](README.md). Type lấy từ `components["schemas"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L10387-L10414) qua [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts#L175-L202). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## WishlistItem

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã mục yêu thích | khóa danh sách, `PriceAlertDialog` |
| `productId` | `number` | Có | Không | Mã sản phẩm; dùng ở `PATCH` và `DELETE` | `WishlistCard` |
| `product` | `PricedProduct` | Có | Không | Sản phẩm kèm giá | `WishlistCard` |
| `alertMode` | `"PERCENT_DROP" \| "TARGET_PRICE"` | Có | Có | Chế độ cảnh báo; null là đang tắt | nhãn trạng thái cảnh báo |
| `targetPrice` | `number` | Có | Có | Giá mục tiêu (chỉ khi `TARGET_PRICE`) | "Mục tiêu: ..." |
| `referencePrice` | `number` | Có | Có | Giá tham chiếu để so | "mốc ..." |
| `includeFlashSale` | `boolean` | Có | Không | Có theo dõi Flash Sale | hộp kiểm trong dialog |
| `alertVersion` | `number` | Có | Không | Tăng mỗi lần đổi cấu hình cảnh báo | không dùng ở UI |
| `priceSnapshot` | `PriceSnapshot` | Có | Xem ghi chú | Giá hiệu lực tại thời điểm trả về; web dùng `effectivePrice` và nguồn giá | giá hiện tại, "giá hiện tại" trong dialog |
| `lastAlertMode` | `"PERCENT_DROP" \| "TARGET_PRICE"` | Có | Có | Chế độ của lần báo gần nhất | "Đã đạt mục tiêu" |
| `lastAlertedPrice` | `number` | Có | Có | Giá lúc báo gần nhất | "Thông báo gần nhất" |
| `lastAlertedAt` | `string` (ISO) | Có | Có | Thời điểm báo gần nhất | "Thông báo gần nhất" |
| `createdAt`, `updatedAt` | `string` (ISO) | Có | Không | Thời điểm tạo, sửa | không dùng ở UI |

Mã web dùng `item.priceSnapshot?.effectivePrice`, tức coi `priceSnapshot` có thể vắng ([WishlistCard.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/wishlist/WishlistCard/WishlistCard.tsx#L29-L30)); khai báo trong `schema.d.ts` là bắt buộc. `PriceSnapshot` gồm `productId`, `listPrice`, `stablePrice`, `effectivePrice`, `source` (`LIST_PRICE`, `AUTOMATIC`, `FLASH_SALE`), `promotionId`, `pricingVersion`, `validUntil`, `purchasable`.

## WishlistPage

`{ data: WishlistItem[], meta }` với `meta` gồm `page`, `pageSize`, `total`, `totalPages` và `flashSaleAlertEnabled` (cờ backend; web ẩn tùy chọn Flash Sale khi `false`) ([wishlist.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/wishlist/wishlist.service.ts#L70)).

## WishlistSummary, WishlistStatus

| Type | Field | Ý nghĩa |
| --- | --- | --- |
| `WishlistSummary` | `itemCount: number` | Số mục, hiện ở header |
| `WishlistStatus` | `productId: number`, `isWishlisted: boolean` | Trạng thái từng sản phẩm đang hiển thị |

## ConfigurePriceAlertInput

Body của `PATCH /wishlist/items/{productId}` ([wishlist.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/wishlist/wishlist.schema.ts#L41-L51)).

| Biến thể | Field | Ràng buộc |
| --- | --- | --- |
| `PERCENT_DROP` | `mode`, `includeFlashSale?` | không có field khác |
| `TARGET_PRICE` | `mode`, `targetPrice`, `includeFlashSale?` | `targetPrice` nguyên dương, thấp hơn giá hiện tại |
| Tắt | `mode: null` | không có field khác |

Form web ([schema.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/wishlist/schema.ts#L4-L11)) dùng `discriminatedUnion` theo `mode` để `targetPrice` cũ không chặn `PERCENT_DROP`.

## Ý định chờ đăng nhập

Lưu ở `sessionStorage` khóa `laptopshop.wishlist.intent` ([intent.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/wishlist/intent.ts#L3-L11)).

| Field | Type | Ý nghĩa |
| --- | --- | --- |
| `version` | `1` | Phiên bản định dạng |
| `action` | `"ADD_WISHLIST"` | Hành động chờ |
| `productId` | `number` | Số nguyên dương |
| `returnTo` | `string` | Đường dẫn an toàn qua `safeNext` |
| `expiresAt` | `number` | Mốc hết hạn, 10 phút sau khi lưu |
