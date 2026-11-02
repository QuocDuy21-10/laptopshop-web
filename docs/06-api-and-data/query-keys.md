# Query keys

Query key là khóa nhận diện một mục dữ liệu trong cache của TanStack Query. Toàn bộ khóa được khai báo ở một nơi duy nhất, [query-keys.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/query-keys.ts), để mọi hook và mọi lệnh làm mới dùng cùng một tên.

## Quy ước

- Hook không tự viết mảng key; luôn dùng `queryKeys.<tên>`.
- Key nào gắn với dữ liệu riêng của người dùng thì chứa `userId`, ví dụ `wishlist`, `notifications`, `reviewEligibility`, `afterSales*`. Vị trí của `userId` không cố định: ngay sau tên nhóm ở `wishlist` và `notifications`, ở cuối ở `reviewEligibility`. Nhờ vậy dữ liệu của hai tài khoản không lẫn khi đổi tài khoản trong cùng trình duyệt.
- Key dạng hằng (không có tham số) nằm ngay dạng mảng, như `queryKeys.cart`; key có tham số là hàm, như `queryKeys.order(id)`.
- Làm mới theo tiền tố: TanStack Query khớp theo tiền tố mảng, nên `invalidateQueries({ queryKey: queryKeys.ordersAll })` làm mới mọi key bắt đầu bằng `["orders", ...]`.
- Mọi mutation trong trang quản trị làm mới `queryKeys.adminAll` (`["admin"]`), tức mọi danh sách, chi tiết và dashboard của admin (theo chú thích trong file).

## Các nhóm key

| Nhóm | Khóa tiêu biểu | Ghi chú |
| --- | --- | --- |
| Phiên | `me` | Người dùng hiện tại, gồm `cartItemCount`. |
| Giỏ hàng, đặt hàng | `cart`, `checkoutQuote(couponCode?)` | Báo giá phụ thuộc mã giảm giá. |
| Đơn hàng | `ordersAll`, `orders(page)`, `order(id)` | `order(id)` là `["order", id]`, không nằm dưới `ordersAll`. |
| Thanh toán | `payment(orderId)`, `paymentMethods` | |
| Yêu thích | `wishlistAll(userId)`, `wishlist(userId, page)`, `wishlistSummary`, `wishlistStatus` | Danh sách id trong `wishlistStatus` được khử trùng lặp và sắp xếp. |
| Thông báo | `notificationsAll(userId)`, `notifications(userId, page)`, `notificationUnreadCount`, `notificationPreferences` | |
| Khuyến mãi | `promotionsAvailable`, `flashSaleAvailability(productIds)` | |
| Sản phẩm | `productFilters`, `productFacets(query)`, `searchSuggest(q)`, `compare(ids)`, `homeBestsellers(target, renderedAt)` | |
| Đánh giá | `reviews(productId)`, `reviewSummary`, `productReviews`, `reviewEligibility`, `reviewImages`, `reviewHelpfulState`, ... | Nhiều key phụ cho ảnh và đồng bộ ảnh. |
| Hậu mãi | `afterSalesDevices`, `afterSalesRequests`, `afterSalesRequest`, `afterSalesAttachments` | Gắn `userId`. |
| Quản trị | `adminAll`, `adminProducts(query)`, `adminOrders(query)`, `adminUsers(query)`, ... | Mọi key bắt đầu bằng `"admin"`. |

Danh sách đầy đủ xem trực tiếp trong file nguồn; bảng trên chỉ gom theo nghiệp vụ.

## Ví dụ làm mới thực tế

Hủy đơn hàng cập nhật chi tiết đơn ngay từ kết quả trả về, rồi làm mới ba nhóm khác khi xong ([orders/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/orders/hooks.ts#L22-L34)):

```ts
onSuccess: (body) => qc.setQueryData(queryKeys.order(id), body.data),
onSettled: () =>
  Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.order(id) }),
    qc.invalidateQueries({ queryKey: queryKeys.ordersAll }),
    qc.invalidateQueries({ queryKey: queryKeys.me }),
  ]),
```

Phải gọi riêng `order(id)` vì `["order", id]` không bắt đầu bằng `["orders"]`. Thêm hoặc xóa mặt hàng trong giỏ cũng làm mới `me` vì `Me` chứa `cartItemCount`, con số hiển thị trên biểu tượng giỏ hàng ([cart/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/cart/hooks.ts)).

Mutation quản trị làm mới toàn bộ nhóm `admin` ([admin/products/hooks.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/products/hooks.ts#L32)):

```ts
onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
```

## Thêm một key mới

1. Thêm vào `queryKeys` với tên theo nhóm. Nếu dữ liệu riêng của người dùng, thêm `userId`.
2. Nếu key sẽ cần làm mới theo nhóm, cho nó dùng chung tiền tố với một key `...All`.
3. Dùng key đó cả ở `useQuery` lẫn ở mọi `invalidateQueries`/`setQueryData` liên quan.

## Đọc tiếp

- [Lớp gọi API](api-layer.md)
- [Rendering và cache](../02-architecture/rendering-and-caching.md)
