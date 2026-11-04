# Data dictionary: Store info

Contract dữ liệu của module [Store info](../../04-features/store-info.md). Cách đọc ở [README](README.md).

## StoreInfo

Trả về bởi `GET /api/v1/store-info` (trong `data`). Nguồn: [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L453-L463), dựng ở [store-info.controller.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/store-info/store-info.controller.ts#L5-L15).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Nguồn giá trị | Dùng ở UI |
| --- | --- | --- | --- | --- | --- | --- |
| `hotline` | `string` | Có | Có | Số hotline | `STORE_HOTLINE` (tối đa 50) | chân trang, khối thông tin mua sắm |
| `supportEmail` | `string` | Có | Có | Email hỗ trợ | `STORE_SUPPORT_EMAIL` (email hợp lệ, tối đa 255) | chân trang, khối thông tin mua sắm |
| `supportHours` | `string` | Có | Có | Giờ hỗ trợ | `STORE_SUPPORT_HOURS` (tối đa 100) | đi kèm hotline |
| `vatInvoice` | `boolean` | Có | Không | Có xuất hóa đơn VAT | `STORE_VAT_INVOICE`, mặc định `false` | nhãn "Hóa đơn VAT" |
| `paymentMethods` | `string[]` | Có | Không | Mã phương thức thanh toán đang bật (`COD`, `BANK_TRANSFER`) | cờ `BANK_TRANSFER_ENABLED` | nhãn thanh toán |

Nhãn tiếng Việt của mã thanh toán: `COD` là "Thanh toán COD", `BANK_TRANSFER` là "Chuyển khoản QR" ([labels.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/store-info/labels.ts#L2)). Mã không có trong bảng nhãn bị bỏ.

Web nhận kiểu `StoreInfo | null`: `null` khi API lỗi hoặc không phải 2xx ([server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/store-info/server.ts#L6-L13)).
