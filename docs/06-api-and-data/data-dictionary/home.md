# Data dictionary: Home

Contract dữ liệu của module [Home](../../04-features/home.md). Cách đọc ở [README](README.md). Type lấy từ `components["schemas"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L11119-L11143). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## HomeData

Kết quả của `getHomeData` ([server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/home/server.ts#L8-L17)), chỉ dùng ở server.

| Field | Type | Nullable | Ý nghĩa | Giá trị dự phòng khi lỗi |
| --- | --- | --- | --- | --- |
| `banners` | `{ hero: PublicHomeBanner[], side: PublicHomeBanner[] }` | Không | Banner đang hiển thị | cả hai mảng rỗng |
| `options` | `FilterOptions` | Có | Bộ lọc, nguồn của tab nhu cầu | `null` |
| `targetImages` | `Record<string, string \| null>` | Không | Ảnh sản phẩm bán chạy nhất theo mỗi nhu cầu | `null` cho từng nhu cầu lỗi |
| `flashSale` | `CatalogProduct[]` | Không | Sản phẩm Flash Sale, tối đa 8 | mảng rỗng |
| `bestsellers` | `CatalogProduct[]` | Có | Bán chạy, tối đa 8 | `null` (client tự tải) |
| `reviews` | `ReviewHighlights` | Có | Đánh giá nổi bật, tối đa 6 | `null` |
| `storeInfo` | `StoreInfo` | Có | Thông tin cửa hàng | `null` |
| `renderedAt` | `string` (ISO) | Không | Thời điểm dựng trang; mốc cho bộ đếm Flash Sale và khóa truy vấn bán chạy | |

## PublicHomeBanner

Trả về bởi `GET /api/v1/home-banners` (`{ hero, side }`).

| Field | Type | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- |
| `id` | `number` | Không | Mã banner | khóa danh sách |
| `eyebrow` | `string` | Có | Nhãn nhỏ phía trên (tối đa 60) | thẻ ưu đãi |
| `title` | `string` | Không | Tiêu đề (1 đến 80) | hero, thẻ |
| `highlight` | `string` | Có | Điểm nhấn (tối đa 80) | hero, thẻ |
| `description` | `string` | Có | Mô tả (tối đa 200) | hero, thẻ |
| `ctaText`, `linkUrl` | `string` | Có | Nút chính và liên kết; chỉ `HERO`, đi cùng nhau | hero |
| `secondaryCtaText`, `secondaryLinkUrl` | `string` | Có | Nút phụ và liên kết; chỉ `HERO`, đi cùng nhau | hero |
| `badges` | `string[]` | Không | Huy hiệu, tối đa 2, mỗi cái tối đa 40; chỉ `HERO` | hero |
| `imageUrl` | `string` | Có | Ảnh | hero, thẻ |
| `imageAlt` | `string` | Có | Mô tả ảnh; bắt buộc khi có ảnh | hero, thẻ |

Thẻ `SIDE` có `linkUrl` thì cả thẻ là liên kết ([HomeHero.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/home/HomeHero/HomeHero.tsx#L26-L32)).

## AdminHomeBanner

`PublicHomeBanner` cộng thêm:

| Field | Type | Nullable | Ý nghĩa |
| --- | --- | --- | --- |
| `placement` | `"HERO" \| "SIDE"` | Không | Vị trí (nhãn "Banner hero", "Thẻ ưu đãi") |
| `position` | `number` | Không | Thứ tự, 0 đến 9999 |
| `isActive` | `boolean` | Không | Bật hoặc tắt |
| `startsAt`, `endsAt` | `string` (ISO) | Có | Khoảng hiển thị; để trống là không giới hạn đầu đó |
| `status` | `"ACTIVE" \| "SCHEDULED" \| "EXPIRED" \| "INACTIVE"` | Không | Trạng thái suy ra (nhãn "Đang hiển thị", "Hẹn giờ", "Hết hạn", "Đang tắt") |

Nhãn ở [labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/home-banners/labels.ts#L3-L13). Quy tắc kiểm tra ở [home-banners.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/home-banners/home-banners.schema.ts#L43-L93).
