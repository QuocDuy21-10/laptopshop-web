# Data dictionary: Cart

Contract dữ liệu của module [Cart](../../04-features/cart.md) thuộc phạm vi frontend. Cách đọc các cột ở [README](README.md). Cấu trúc bảng giỏ hàng trong cơ sở dữ liệu (model `Cart`, `CartDetail`) thuộc backend: xem [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma). Mọi số tiền là VND, số nguyên, do server tính.

> [!NOTE]
> `types.ts` đổi `listLineTotal`, `productDiscountAmount` của `CartItem` và `productDiscount`, `totalAfterProductDiscount` của `Cart` thành tùy chọn, và dùng `PricedProduct` đã chỉnh cho `product` ([types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts#L47-L74)). Cột "Bắt buộc" ghi theo type mà frontend dùng. Khi các field tùy chọn vắng, `CartSummary` dùng `0` cho giảm giá và `subtotal` cho tổng ([CartSummary.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/CartSummary/CartSummary.tsx#L12-L20)).

## Cart

Trả về bởi `GET /api/v1/cart` và bởi các thao tác thêm, sửa (`data`). Nguồn: `components["schemas"]["Cart"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts); công thức tính nằm ở [cart.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/cart/cart.service.ts#L20-L43).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `items` | `CartItem[]` | Có | Không | Các dòng giỏ, sắp xếp theo `id` tăng dần | | `CartView`, `MiniCart` |
| `itemCount` | `number` | Có | Không | Tổng số lượng của mọi dòng (không phải số dòng) | `3` | `CartSummary` ("N sản phẩm") |
| `subtotal` | `number` | Có | Không | Tổng giá niêm yết (`price` × số lượng) | `51980000` | dự phòng của tổng cộng |
| `productDiscount` | `number` | Tùy chọn | Không | Tổng giảm giá sản phẩm | `2000000` | dòng "Ưu đãi sản phẩm" khi lớn hơn 0 |
| `totalAfterProductDiscount` | `number` | Tùy chọn | Không | `subtotal` trừ `productDiscount`; chưa gồm mã giảm giá | `49980000` | "Tổng cộng" |

Không có field phí vận chuyển hay thuế trong giỏ; frontend không tự thêm.

## CartItem

Một dòng giỏ hàng.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã dòng giỏ; dùng ở `PATCH` và `DELETE` (không phải mã sản phẩm) | `7` | `CartLine` |
| `quantity` | `number` | Có | Không | Số lượng | `2` | bộ chọn số lượng |
| `listLineTotal` | `number` | Tùy chọn | Không | Giá niêm yết × số lượng | `51980000` | chưa xác minh chỗ hiển thị |
| `productDiscountAmount` | `number` | Tùy chọn | Không | Giảm giá của dòng (giảm trên một đơn vị × số lượng) | `4000000` | chưa xác minh chỗ hiển thị |
| `lineTotal` | `number` | Có | Không | `(price - giảm trên một đơn vị) × số lượng` | `47980000` | tổng dòng (`CartLine`) |
| `product` | `PricedProduct` | Có | Không | Sản phẩm kèm giá (xem bên dưới) | | tên, ảnh, giá, tồn kho |
| `promotionFallback` | object | Có (theo schema) | Có | Có giá trị khi suất flash sale không đủ (xem bên dưới) | `null` | ghi chú dưới dòng |

## promotionFallback

Giải thích vì sao một dòng không nhận được giá flash sale.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `skippedKind` | `"FLASH_SALE"` | Có | Không | Loại khuyến mãi bị bỏ qua |
| `promotionId` | `number` | Có | Không | Mã chương trình |
| `reason` | `"GLOBAL_QUOTA"`, `"USER_QUOTA"` hoặc `"GLOBAL_AND_USER_QUOTA"` | Có | Không | Hết suất chung, hết lượt của người dùng, hoặc cả hai |
| `requestedQuantity` | `number` | Có | Không | Số lượng người dùng đang muốn mua |
| `availableQuantity` | `number` | Có | Không | Số suất còn lại; lớn hơn 0 thì gợi ý giảm số lượng |
| `appliedPromotionKind` | `"AUTOMATIC"` hoặc `null` | Có | Có | Giá thay thế đang áp dụng: `AUTOMATIC` là giá khuyến mãi, `null` là giá niêm yết |

Nội dung ghi chú sinh bởi `fallbackNote` ([CartLine.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/CartLine/CartLine.tsx#L14-L26)): nếu `availableQuantity` lớn hơn 0 thì gợi ý giảm xuống số suất còn lại; nếu bằng 0 thì báo dòng được tính theo giá thay thế. `USER_QUOTA` dùng cách nói "Bạn chỉ được mua", các lý do còn lại dùng "Chỉ còn".

## PricedProduct

Sản phẩm trong dòng giỏ, gồm các field của sản phẩm danh mục (`id`, `name`, `price`, `image`, `quantity`, `isActive`, thông số kỹ thuật...) cộng thông tin khuyến mãi. Định nghĩa từng field xem [Data dictionary: Products](products.md#catalogproduct); `PricedProduct` khác `CatalogProduct` ở chỗ không có `effectiveCatalogPrice` và `reviewSummary`.

Các field giỏ hàng dùng trực tiếp:

| Field | Ý nghĩa trong giỏ | Dùng ở UI |
| --- | --- | --- |
| `product.salePrice` | Giá một đơn vị sau giảm; không có thì dùng `price` | giá dưới tên sản phẩm |
| `product.quantity` | Tồn kho; giới hạn trên của bộ chọn số lượng cùng với 100 | `QuantityStepper` |
| `product.isActive` | Còn bán; sai thì badge "Ngừng kinh doanh" và chặn đặt hàng | `CartLine`, `CartView` |

## CartItemInput (thêm, sửa)

Body gửi lên, kiểm tra ở backend ([cart.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/cart/cart.schema.ts)).

| Request | Field | Type | Bắt buộc | Validation | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| `POST /api/v1/cart/items` | `productId` | `number` | Có | số nguyên dương | `12` |
| `POST /api/v1/cart/items` | `quantity` | `number` | Có | số nguyên từ 1 đến 100 | `1` |
| `PATCH /api/v1/cart/items/{id}` | `quantity` | `number` | Có | số nguyên từ 1 đến 100 | `2` |

## PendingCartIntent (ý định thêm giỏ chờ đăng nhập)

Dữ liệu cục bộ của trình duyệt, không gửi lên API. Nguồn: [intent.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/intent.ts). Lưu trong `sessionStorage`, khóa `laptopshop.cart.intent`.

| Field | Type | Bắt buộc | Validation khi đọc | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| `productId` | `number` | Có | số nguyên dương | Sản phẩm muốn thêm | `12` |
| `quantity` | `number` | Có | số nguyên dương | Số lượng muốn thêm | `1` |
| `goToCart` | `boolean` | Có | phải là boolean | Có chuyển tới `/cart` sau khi thêm (từ nút "Mua ngay") | `false` |
| `expiresAt` | `number` (mili giây) | Có | lớn hơn hiện tại và không quá hiện tại cộng 10 phút | Thời điểm hết hạn | `1767225600000` |

Giá trị không hợp lệ hoặc hết hạn bị xóa và coi như không có ý định.
