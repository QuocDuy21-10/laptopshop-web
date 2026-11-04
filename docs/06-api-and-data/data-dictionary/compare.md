# Data dictionary: Compare

Contract dữ liệu của module [Compare](../../04-features/compare.md). Cách đọc ở [README](README.md).

## CompareItem (lưu trong localStorage)

Khóa `laptopshop.compare`, giá trị là mảng JSON ([store.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/compare/store.ts#L1-L24)).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Ràng buộc khi đọc |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã sản phẩm | nguyên, từ 1 đến 999.999.999 |
| `name` | `string` | Có | Không | Tên hiển thị trên thanh so sánh | |
| `image` | `string` | Có | Có | Ảnh nhỏ | chuỗi hoặc null |

Mảng tối đa 4 phần tử (`MAX_COMPARE`); phần tử sai kiểu hoặc trùng `id` bị loại khi đọc.

## Truy vấn `ids`

`ids` trong URL `/compare` và trong `GET /products/compare` là chuỗi mã phân cách bằng dấu phẩy. API chỉ nhận 2 đến 4 mã, mỗi mã 1 đến 9 chữ số, không trùng ([products.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/products/products.schema.ts#L166-L178)).

## Response

`{ data: PricedProduct[] }` theo đúng thứ tự `ids`. `PricedProduct` mô tả ở [Data dictionary: Products](products.md); các field dùng trong bảng so sánh:

| Field | Dùng ở UI | Cách so sánh |
| --- | --- | --- |
| `cpu`, `gpu`, `screenResolution` | dòng văn bản | không xếp hạng |
| `ramGb`, `storageGb`, `refreshRateHz`, `batteryWh`, `warrantyMonths` | dòng số | cao hơn là tốt hơn |
| `screenSizeInch` | dòng số | không xếp hạng |
| `weightGrams` | dòng số | thấp hơn là tốt hơn |
| `salePrice` (hoặc `price`), `promotion` | dòng "Giá" qua `PromotionPrice` | thấp hơn là tốt hơn |

Định dạng và nhãn từng dòng ở [specs.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/compare/specs.ts#L28-L49).

## Lỗi 404

`{ error: { code: "NOT_FOUND", details: { missingIds: number[] } } }` khi có mã không tồn tại hoặc sản phẩm ngừng bán ([products.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/products/products.service.ts#L139-L144)).
