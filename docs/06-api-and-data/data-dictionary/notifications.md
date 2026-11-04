# Data dictionary: Notifications

Contract dữ liệu của module [Notifications](../../04-features/notifications.md). Cách đọc ở [README](README.md). Cấu trúc bảng thuộc backend: [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma).

## InAppNotification

Nguồn: `components["schemas"]["Notification"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L10415-L10432).

| Field | Type | Bắt buộc | Nullable | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- | --- | --- |
| `id` | `number` | Có | Không | Mã thông báo | khóa danh sách, đánh dấu đã đọc |
| `productId` | `number` | Có | Có | Sản phẩm liên quan | điều hướng tới `/products/{id}` |
| `type` | `"PRICE_DROP"` | Có | Không | Loại theo `schema.d.ts` | không hiển thị |
| `title`, `message` | `string` | Có | Không | Nội dung | danh sách |
| `oldPrice`, `newPrice` | `number` | Có | Có | Giá trước và sau | danh sách (`formatVnd`) |
| `priceSource` | `"LIST_PRICE" \| "AUTOMATIC" \| "FLASH_SALE"` | Có | Có | Nguồn giá | không hiển thị |
| `promotionId`, `pricingVersion` | `number` | Có | Có | Khuyến mãi gắn với giá | không hiển thị |
| `validUntil` | `string` (ISO) | Có | Có | Hạn của giá | không hiển thị |
| `readAt` | `string` (ISO) | Có | Có | Thời điểm đọc; null là chưa đọc | huy hiệu chưa đọc, `data-read` |
| `createdAt` | `string` (ISO) | Có | Không | Thời điểm tạo | ngày hiển thị |

> [!NOTE]
> `schema.d.ts` chỉ khai báo loại `PRICE_DROP` và không có `serviceRequestId`, trong khi backend có nhóm thông báo `AFTER_SALES` và web đọc `serviceRequestId` bằng ép kiểu ([NotificationList.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/notifications/NotificationList/NotificationList.tsx#L17)). Chạy lại `pnpm gen:api` có thể đổi điều này.

## NotificationPage

`{ data: InAppNotification[], meta }` với `meta` gồm `page`, `pageSize`, `total`, `totalPages`. Bộ đếm chưa đọc lấy riêng từ `GET /notifications/unread-count` (`{ unreadCount }`).

## NotificationPreferences

Định nghĩa trong [types.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/types.ts#L189-L195).

| Field | Type | Bắt buộc | Ý nghĩa |
| --- | --- | --- | --- |
| `inAppEnabled` | `boolean` | Có | Luôn bật; giao diện hiện ô khóa |
| `emailEnabled` | `boolean` | Có | Nhận email; chỉ bật được khi email đã xác minh |
| `webPushEnabled` | `boolean` | Có | Nhận Web Push |
| `afterSalesEmailEnabled` | `boolean` | Không | Email cho cập nhật hậu mãi; thiếu thì web coi là bật |
| `afterSalesWebPushEnabled` | `boolean` | Không | Web Push cho cập nhật hậu mãi; thiếu thì web coi là bật |

Body `PATCH /notification-preferences` gồm bốn cờ (không có `inAppEnabled`), ít nhất một cờ, không field lạ ([notification-preferences.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/notifications/notification-preferences.schema.ts#L3-L20)).

## Enum

| Enum | Giá trị | Nguồn |
| --- | --- | --- |
| Nhóm thông báo | `PRICE_ALERT`, `AFTER_SALES` | [notification-publish.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/notifications/notification-publish.service.ts#L3) |
| Kênh gửi | `EMAIL`, `WEB_PUSH` | [admin-notifications.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/notifications/admin-notifications.schema.ts#L17) |
| Trạng thái lần gửi | `PENDING`, `PROCESSING`, `DELIVERED`, `RETRYING`, `FAILED`, `DEAD`, `CANCELLED`, `SUPPRESSED` | cùng file, dòng 5-16 |

## Lần gửi thử lại (admin)

Body `POST /admin/notification-deliveries/{id}/retry`: `{ reason: string }` (1 đến 255 ký tự, không field lạ). Thành công trả `{ id, status }` với `status` là `PENDING`.
