# Data dictionary: Products

Contract dữ liệu của module [Products](../../04-features/products.md) thuộc phạm vi frontend. Cách đọc các cột ở [README](README.md). Cấu trúc bảng sản phẩm trong cơ sở dữ liệu thuộc backend: xem model `Product` trong [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

> [!NOTE]
> `types.ts` đổi một số field của `CatalogProduct` (`cpuBrand`, `gpuBrand`, `gpuType`, `resolutionTier`, `panelType`, `salePrice`, `productDiscountAmount`, `promotion`) thành tùy chọn, trong khi `schema.d.ts` khai báo là bắt buộc ([types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts#L47-L63)). Cột "Bắt buộc" dưới đây ghi theo type mà code frontend dùng (`CatalogProduct` trong `types.ts`).

## CatalogProduct

Một sản phẩm trong danh sách và trang chi tiết. Nguồn: `components["schemas"]["CatalogProduct"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts). Tiền tệ là VND, số nguyên (hiển thị bằng `formatVnd`).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ví dụ | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã sản phẩm, dùng trong URL `/products/[id]` | `12` | liên kết, giỏ hàng |
| `name` | `string` | Có | Không | Tên sản phẩm | `Laptop mẫu 15` | tiêu đề, `<title>` |
| `price` | `number` | Có | Không | Giá niêm yết | `25990000` | `PromotionPrice` (giá gạch khi có giảm) |
| `image` | `string` | Có | Có | Đường dẫn ảnh | `/images/product/a.png` | `ProductImage` |
| `detailDesc` | `string` | Có | Có | Mô tả chi tiết, tách đoạn bằng dòng trống | | mục "Mô tả sản phẩm" |
| `shortDesc` | `string` | Có | Có | Mô tả ngắn | | đoạn nổi bật, `description` của trang |
| `quantity` | `number` | Có | Không | Số lượng tồn; `0` nghĩa là hết hàng | `5` | badge "Còn hàng"/"Hết hàng", giới hạn số lượng |
| `sold` | `number` | Có | Có | Số đã bán | `120` | sắp xếp `sold_desc`; chưa xác minh chỗ hiển thị |
| `factory` | `string` | Có | Có | Mã hãng, tra tên qua `factoryOptions` | `ASUS` | nhãn hãng |
| `target` | `string` | Có | Có | Mã nhu cầu, tra tên qua `targetOptions` | `GAMING` | liên kết `/products?target=...` |
| `isActive` | `boolean` | Có | Không | Sản phẩm còn bán | `true` | chưa xác minh chỗ dùng |
| `cpu` | `string` | Có | Có | Tên CPU | | `SpecTable` |
| `cpuBrand` | `string` | Tùy chọn | Có | Hãng CPU | `AMD` | lọc, `SpecTable` |
| `gpu` | `string` | Có | Có | Tên GPU | | `SpecTable` |
| `gpuBrand` | `string` | Tùy chọn | Có | Hãng GPU | `NVIDIA` | lọc |
| `gpuType` | `string` | Tùy chọn | Có | `INTEGRATED` hoặc `DEDICATED` | `DEDICATED` | lọc |
| `ramGb` | `number` | Có | Có | RAM (GB) | `16` | lọc, `SpecTable` |
| `storageGb` | `number` | Có | Có | Dung lượng lưu trữ (GB) | `512` | lọc, `SpecTable` |
| `screenSizeInch` | `number` | Có | Có | Kích thước màn hình (inch) | `15.6` | `SpecTable` |
| `screenResolution` | `string` | Có | Có | Độ phân giải dạng văn bản | `1920x1080` | `SpecTable` |
| `resolutionTier` | `string` | Tùy chọn | Có | `HD`, `FHD`, `QHD`, `UHD` | `FHD` | lọc |
| `panelType` | `string` | Tùy chọn | Có | Loại tấm nền | `IPS` | lọc |
| `refreshRateHz` | `number` | Có | Có | Tần số quét (Hz) | `144` | lọc theo `minRefreshHz` |
| `batteryWh` | `number` | Có | Có | Dung lượng pin (Wh) | `60` | lọc theo `minBatteryWh` |
| `weightGrams` | `number` | Có | Có | Khối lượng (gram) | `1500` | lọc theo `maxWeightGrams` |
| `warrantyMonths` | `number` | Có | Có | Thời hạn bảo hành (tháng) | `24` | lọc theo `minWarrantyMonths` |
| `salePrice` | `number` | Tùy chọn | Không | Giá bán sau giảm; không có thì dùng `price` | `23990000` | `PromotionPrice` |
| `productDiscountAmount` | `number` | Tùy chọn | Không | Số tiền giảm của khuyến mãi sản phẩm | `2000000` | chưa xác minh chỗ hiển thị trực tiếp |
| `promotion` | object | Tùy chọn | Có | Khuyến mãi đang áp dụng (xem bên dưới) | | `PromotionPrice` |
| `effectiveCatalogPrice` | `number` | Có | Không | Chưa xác minh ý nghĩa; frontend không dùng | | không có |
| `reviewSummary` | object | Có | Không | `{ averageRating: number or null, totalReviews: number }` | `{ "averageRating": 4.5, "totalReviews": 10 }` | `ProductCard`, mục đánh giá |

Phần trăm giảm hiển thị là `Math.round((1 - salePrice / price) * 100)` do frontend tính từ hai giá API trả về, không phải field của API ([PromotionPrice.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/promotions/PromotionPrice/PromotionPrice.tsx#L5-L22)). Frontend không tự cộng thêm giảm giá hay phí.

### promotion

| Field | Type | Bắt buộc | Nullable | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã khuyến mãi |
| `name` | `string` | Có | Không | Tên khuyến mãi |
| `endsAt` | `string` (date-time) | Có | Không | Thời điểm kết thúc |
| `kind` | `"AUTOMATIC"` hoặc `"FLASH_SALE"` | Có | Không | Loại khuyến mãi |
| `eligibility` | `"POTENTIAL"` hoặc `"EXACT"` | Có | Không | `POTENTIAL` với flash sale: giá có thể áp dụng, số suất còn lại được kiểm tra lại ở giỏ hàng |

## ProductFilters (trạng thái bộ lọc trong URL)

Kiểu phía frontend, không phải kiểu API. Sinh bởi `parseFilters` từ `searchParams`, và đổi ngược thành URL bằng `toQueryString`, thành query API bằng `toApiQuery`. Nguồn: [search-params.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/products/search-params.ts#L5-L27). Giá trị hợp lệ từng tham số ở bảng tham số URL trong [trang Products](../../04-features/products.md).

| Field | Type | Bắt buộc | Mặc định | Validation |
| --- | --- | --- | --- | --- |
| `factory`, `target`, `price`, `cpuBrand`, `gpuBrand`, `gpuType`, `screenSize`, `resolutionTier`, `panelType` | `string[]` | Có | `[]` | chỉ giữ giá trị trong danh sách cho phép; loại trùng; tối đa 10 (hoặc `maxSelections`) |
| `ramGb` | `number[]` | Có | `[]` | số nguyên 1 đến 256; tối đa 10 |
| `storageGb` | `number[]` | Có | `[]` | số nguyên 1 đến 16384; tối đa 10 |
| `minRefreshHz`, `minBatteryWh`, `maxWeightGrams`, `minWarrantyMonths` | `number` | Không | không có | phải thuộc tập giá trị cố định |
| `minRating` | `3` hoặc `4` | Không | không có | chỉ 3 hoặc 4 |
| `inStock`, `flashSale` | `boolean` | Không | không có | chỉ `"true"` mới có hiệu lực |
| `sort` | `ProductSort` | Không | không có | một trong bốn giá trị sắp xếp |
| `q` | `string` | Không | không có | cắt khoảng trắng, tối đa 100 ký tự |
| `page` | `number` | Có | `1` | số nguyên dương, sai thì về 1 |

Ví dụ URL: `/products?factory=ASUS&ramGb=16,32&sort=price_asc&page=2`.

## ProductFilterCatalog

Danh mục bộ lọc từ `GET /api/v1/products/filters` (type `FilterOptions` trong `types.ts`).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa |
| --- | --- | --- | --- | --- |
| `factoryOptions` | `{ name: string, value: string }[]` | Có | Không | Hãng; `value` đi vào tham số `factory` |
| `targetOptions` | `{ name: string, value: string }[]` | Có | Không | Nhu cầu; `value` đi vào tham số `target` |
| `facetDefinitions` | `FacetDefinition[]` | Tùy chọn trong `types.ts` (bắt buộc trong `schema.d.ts`) | Không | Định nghĩa từng nhóm bộ lọc |

### FacetDefinition

| Field | Type | Bắt buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `key` | enum | Có | Một trong: `factory`, `target`, `price`, `cpuBrand`, `gpuBrand`, `gpuType`, `ramGb`, `storageGb`, `screenSize`, `resolutionTier`, `panelType`, `minRefreshHz`, `minBatteryWh`, `maxWeightGrams`, `minWarrantyMonths`, `minRating`, `inStock` |
| `name` | `string` | Có | Tên hiển thị |
| `mode` | enum | Có | `MULTI`, `SINGLE_MIN`, `SINGLE_MAX`, `BOOLEAN`: cách chọn |
| `kind` | enum | Có | `categorical`, `exact`, `bucket` |
| `options` | `{ name, value }[]` | Không | Các lựa chọn |
| `maxSelections` | `number` | Không | Số lựa chọn tối đa cho nhóm |

## ProductFacets

Số lượng kết quả theo từng lựa chọn, từ `GET /api/v1/products/facets`.

| Field | Type | Bắt buộc | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- |
| `total` | `number` | Có | Tổng số sản phẩm khớp bộ lọc | `42` |
| `groups` | `{ [key: string]: { value: string, count: number }[] }` | Có | Số lượng theo từng nhóm, khóa là `key` của facet | `{ "factory": [{ "value": "ASUS", "count": 8 }] }` |

## PageMeta

Siêu dữ liệu phân trang của danh sách (`meta`).

| Field | Type | Bắt buộc | Ý nghĩa | Ví dụ |
| --- | --- | --- | --- | --- |
| `page` | `number` | Có | Trang hiện tại | `1` |
| `pageSize` | `number` | Có | Số mục mỗi trang (frontend gửi 12) | `12` |
| `total` | `number` | Có | Tổng số mục | `42` |
| `totalPages` | `number` | Có | Tổng số trang | `4` |

## Dữ liệu cục bộ của trình duyệt

| Khóa | Nơi lưu | Nội dung | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- |
| `recent-searches` | `localStorage` | Mảng chuỗi các từ khóa gần đây | 5 mục, mới nhất trước | [searchHistory.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/products/searchHistory.ts) |
