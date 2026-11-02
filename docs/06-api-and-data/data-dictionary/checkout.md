# Data dictionary: Checkout

Contract dữ liệu của module [Checkout](../../04-features/checkout.md) thuộc phạm vi frontend. Cách đọc các cột ở [README](README.md). Cấu trúc bảng đơn hàng trong cơ sở dữ liệu thuộc backend: xem model `Order`, `OrderDetail` trong [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma). Mọi số tiền là VND, số nguyên, do server tính.

## ReceiverInput

Form thông tin nhận hàng. Nguồn: [schema.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/checkout/schema.ts). Các field này đi vào body của `POST /api/v1/orders`.

| Field | Type | Bắt buộc | Nullable | Mặc định | Validation (web) | Validation (API) | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `receiverName` | `string` | Có | Không | tên trong hồ sơ, hoặc `""` | cắt khoảng trắng, 1 đến 255 ký tự | 1 đến 255 | Tên người nhận hàng | `Nguyễn Văn A` | `CheckoutForm` |
| `receiverPhone` | `string` | Có | Không | số trong hồ sơ, hoặc `""` | khớp `^[0-9+().\s-]{8,20}$` | 8 đến 20 ký tự | Số điện thoại liên hệ | `0901234567` | `CheckoutForm` |
| `receiverAddress` | `string` | Có | Không | địa chỉ trong hồ sơ, hoặc `""` | cắt khoảng trắng, 1 đến 255 ký tự | 1 đến 255 | Địa chỉ giao hàng | `1 Đường Mẫu, Quận 1` | `CheckoutForm` |
| `paymentMethod` | `"COD"` hoặc `"BANK_TRANSFER"` | Không | Không | `COD` | phải là một trong hai giá trị | cùng, mặc định `COD` | Cách thanh toán | `BANK_TRANSFER` | nhóm radio |

Giá trị mặc định điền sẵn lấy từ `useMe` (`fullName`, `phone`, `address`) ([CheckoutView.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/checkout/CheckoutView/CheckoutView.tsx#L62-L67)).

## PlaceOrderBody (body của `POST /api/v1/orders`)

Nguồn: [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) và [orders.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/orders/orders.schema.ts#L5-L13).

| Field | Type | Bắt buộc | Validation (API) | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| `receiverName`, `receiverPhone`, `receiverAddress`, `paymentMethod` | như `ReceiverInput` | như trên | như trên | Thông tin nhận hàng và thanh toán | |
| `couponCode` | `string` | Không | 1 đến 50 ký tự | Mã giảm giá đã áp; bỏ trống nếu không dùng | `GIAM10` |
| `pricingFingerprint` | `string` | Có | đúng 64 ký tự | Dấu vân tay của báo giá lấy từ `PricingQuote`; chứng minh người dùng đã thấy đúng giá | chuỗi 64 ký tự (hex) từ báo giá |

Header kèm theo: `Idempotency-Key` (1 đến 64 ký tự). Frontend dùng `crypto.randomUUID()`.

## PricingQuote

Kết quả của `POST /api/v1/orders/quote`. Nguồn: `components["schemas"]["PricingQuote"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts) (type `PricingQuote` trong [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts)).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `subtotal` | `number` | Có | Không | Tổng giá niêm yết | không hiển thị trực tiếp |
| `productDiscount` | `number` | Có | Không | Tổng giảm giá sản phẩm | dòng "Ưu đãi sản phẩm" |
| `couponEligibleSubtotal` | `number` | Có | Không | Phần tổng đủ điều kiện áp mã | chưa xác minh chỗ hiển thị |
| `couponDiscount` | `number` | Có | Không | Số tiền mã giảm giá | dòng "Giảm giá mã ưu đãi" |
| `total` | `number` | Có | Không | Tổng phải trả | "Tổng cộng" |
| `lines` | mảng | Có | Không | Từng dòng của báo giá (xem bên dưới) | tiền từng sản phẩm |
| `coupon` | object | Có | Có | Thông tin mã đã áp: `id`, `code`, `name`, `valid` (luôn `true`) | chưa xác minh chỗ hiển thị |
| `calculatedAt` | `string` (date-time) | Có | Không | Thời điểm tính giá | không hiển thị |
| `pricingFingerprint` | `string` | Có | Không | Dấu vân tay gửi lại khi đặt hàng | `CheckoutForm` |

### lines

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| `promotionFallback` | object | Có | Có | Giải thích khi suất flash sale không đủ; cùng cấu trúc với [`promotionFallback` của giỏ hàng](cart.md#promotionfallback) | trong `schema.d.ts` |
| `productId` | `number` | Chưa xác minh | Không | Mã sản phẩm của dòng | frontend đọc nhưng không có trong `schema.d.ts` |
| `netLineTotal` | `number` | Chưa xác minh | Không | Tiền dòng sau mọi giảm giá | frontend đọc nhưng không có trong `schema.d.ts` |

> [!WARNING]
> **Chưa xác minh:** `productId` và `netLineTotal` có mặt trong tài liệu OpenAPI của backend ([openapi.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/docs/openapi.ts#L479)) nhưng không có trong `schema.d.ts` hiện có. `CheckoutView` đọc chúng qua kiểm tra kiểu lúc chạy (`quoteLinePricing`). Cần chạy `pnpm gen:api` để đồng bộ.

## PaymentMethodOption

Phần tử của `GET /api/v1/payments/methods`.

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `code` | `"COD"` hoặc `"BANK_TRANSFER"` | Có | Không | Mã phương thức | `BANK_TRANSFER` | quyết định radio nào hiển thị |
| `enabled` | `boolean` | Có | Không | Phương thức đang được bật | `true` | chỉ phương thức `enabled` mới hiển thị |

Khi danh sách chưa tải xong, form chỉ cho chọn `COD`.

## Kết quả đặt hàng

`POST /api/v1/orders` trả `{ data: Order }` (xem [Data dictionary: Orders](orders.md)). Frontend chỉ dùng `id` và `paymentMethod` để điều hướng: `BANK_TRANSFER` tới `/account/orders/{id}/payment`, các trường hợp khác tới `/account/orders/{id}?placed=1`. Mã trạng thái: `201` khi tạo mới, `200` khi khóa idempotency đã được dùng với cùng nội dung.

## Khóa idempotency cục bộ

Dữ liệu cục bộ của trình duyệt, không phải dữ liệu API. Nguồn: [CheckoutForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/checkout/CheckoutForm/CheckoutForm.tsx#L28).

| Khóa | Nơi lưu | Kiểu | Vòng đời |
| --- | --- | --- | --- |
| `laptopshop.checkout.idempotency-key` | `sessionStorage` | chuỗi UUID | Tạo khi vào checkout; giữ qua các lần gửi lại; xóa rồi tạo khóa mới sau khi đặt thành công hoặc khi giá thay đổi |

## Mã lỗi đặc thù của checkout

| Mã | HTTP | Ý nghĩa | Xử lý ở UI |
| --- | --- | --- | --- |
| `CART_EMPTY` | 409 | Giỏ trống | Chuyển về `/cart` |
| `OUT_OF_STOCK`, `PRODUCT_UNAVAILABLE` | 409 | Hết hàng hoặc ngừng bán | Lỗi kèm liên kết về giỏ |
| `PROMOTION_CHANGED` | 409 | Dấu vân tay không còn khớp giá hiện tại | Đổi khóa, tải lại báo giá, báo người dùng xác nhận lại |
| `FLASH_SALE_QUOTA_EXCEEDED`, `FLASH_SALE_USER_LIMIT` | 409 | Hết suất flash sale chung hoặc của người dùng | Như `PROMOTION_CHANGED` |
| `IDEMPOTENCY_KEY_REUSED` | 409 | Khóa dùng lại với nội dung khác | Hiện thông báo lỗi chung |
| `PAYMENT_METHOD_UNAVAILABLE` | 409 | Chuyển khoản chưa được bật | "Thanh toán chuyển khoản hiện chưa khả dụng." |
| `CHECKOUT_ATTEMPT_NOT_FOUND` | 404 | Không có đơn cho khóa đã lưu | Mở khóa form, cho đặt hàng bình thường |

`PROMOTION_CHANGED`, `IDEMPOTENCY_KEY_REUSED` và `CHECKOUT_ATTEMPT_NOT_FOUND` chưa có thông báo riêng trong bảng `MESSAGES` ([errors.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/errors.ts#L23-L78)). `CheckoutForm` tự xử lý hai mã đầu và cuối bằng nhánh riêng; `IDEMPOTENCY_KEY_REUSED` hiện thông báo chung "Đã có lỗi xảy ra. Vui lòng thử lại.".
