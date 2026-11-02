# LaptopShop là gì

LaptopShop là cửa hàng bán laptop trực tuyến. Khách hàng tìm máy, so sánh cấu hình, đặt hàng, thanh toán và theo dõi bảo hành ở một nơi. Nhân viên cửa hàng dùng trang quản trị để vận hành. Trang này dành cho người không làm kỹ thuật; thuật ngữ khó có giải thích ở [Thuật ngữ](glossary.md).

## Khách hàng làm được gì

| Việc cần làm | Trang tương ứng | Cần đăng nhập |
| --- | --- | --- |
| Xem trang chủ, ưu đãi nổi bật | `/` | Không |
| Duyệt và tìm laptop, lọc theo cấu hình | `/products` | Không |
| Xem chi tiết một máy, đọc đánh giá | `/products/[id]` | Không |
| So sánh nhiều máy | `/compare` | Không |
| Nhờ tư vấn chọn máy theo nhu cầu và ngân sách | `/advisor` | Không |
| Xem mã giảm giá và khuyến mãi đang chạy | `/promotions` | Không |
| Lưu máy yêu thích | `/wishlist` | Có |
| Quản lý giỏ hàng | `/cart` | Có |
| Đặt hàng | `/checkout` | Có |
| Thanh toán đơn bằng chuyển khoản | `/account/orders/[id]/payment` | Có |
| Xem, hủy đơn hàng | `/account/orders` | Có |
| Xem thông tin bảo hành, gửi yêu cầu hậu mãi | `/account/warranties`, `/account/after-sales` | Có |
| Xem thông báo và cài đặt thông báo | `/account/notifications` | Có |
| Đăng ký nhận ưu đãi qua email | xác nhận tại `/newsletter/confirm` | Không |

Nguồn: các file `page.tsx` trong [src/app](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/src/app). Cột "Cần đăng nhập" lấy theo danh sách route được bảo vệ trong [guarded-routes.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/guarded-routes.ts).

## Hành trình mua hàng

1. **Tìm máy.** Khách duyệt danh mục, tìm theo tên hoặc lọc theo cấu hình, hoặc dùng trang tư vấn.
2. **So sánh.** Khách đặt các máy cạnh nhau để xem khác biệt.
3. **Bỏ vào giỏ.** Khách cần đăng nhập để dùng giỏ hàng; nếu chưa, hệ thống mời đăng nhập rồi tiếp tục thao tác đang dở.
4. **Đặt hàng.** Khách nhập thông tin người nhận, chọn cách thanh toán và có thể áp mã giảm giá. Giá cuối cùng do hệ thống tính.
5. **Thanh toán.** Với chuyển khoản, khách thấy hướng dẫn và mã QR để thanh toán.
6. **Theo dõi đơn.** Khách xem trạng thái đơn và có thể hủy khi còn được phép.
7. **Bảo hành và hỗ trợ.** Sau khi mua, khách xem quyền lợi bảo hành và gửi yêu cầu hậu mãi.

## Nhân viên cửa hàng làm được gì

Trang quản trị nằm dưới `/admin` và gồm các nhóm chức năng sau.

| Nhóm | Mục đích |
| --- | --- |
| Tổng quan | Xem số liệu bán hàng. |
| Sản phẩm, khuyến mãi, banner trang chủ | Quản lý danh mục và nội dung quảng bá. |
| Đơn hàng, thanh toán | Theo dõi và xử lý đơn, kiểm tra các sự kiện thanh toán. |
| Kho | Nhập kho, điều chỉnh tồn kho, xem lịch sử biến động. |
| Người dùng, đánh giá | Quản lý tài khoản, kiểm duyệt đánh giá. |
| Hậu mãi, thông báo, bản tin | Xử lý yêu cầu bảo hành, vận hành thông báo và email ưu đãi. |

## Ranh giới giữa web và backend

Repo này là giao diện. Mọi điều quyết định đến tiền và dữ liệu đều thuộc backend:

- Giá, giảm giá, phí và tổng tiền do backend tính; giao diện chỉ hiển thị.
- Tồn kho, trạng thái đơn và trạng thái thanh toán do backend quản lý.
- Quyền truy cập do backend kiểm tra; giao diện chỉ ẩn hoặc chuyển hướng để thuận tiện cho người dùng.

Chi tiết kỹ thuật ở [Tổng quan kiến trúc](../02-architecture/overview.md) và [Mô hình bảo mật](../11-security/security-model.md).

## Đọc tiếp

- [Thuật ngữ](glossary.md)
- [Danh sách module và tài liệu tính năng](../04-features/README.md)
