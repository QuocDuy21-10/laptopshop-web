# Chỉ mục sơ đồ

Tất cả sơ đồ viết bằng Mermaid, hiển thị được trên GitHub và trên site tài liệu. Mỗi sơ đồ đều có phần giải thích bằng lời: thành phần, đường đi dữ liệu và tình huống ngoại lệ.

## Sơ đồ hệ thống

| Sơ đồ | Trả lời câu hỏi |
| --- | --- |
| [C4 System Context](c4-context.md) | Ai dùng LaptopShop Web và nó phụ thuộc hệ thống ngoài nào? |
| [C4 Container](c4-container.md) | Khi triển khai có những tiến trình nào, request đi qua đâu? |
| [Component frontend](components.md) | Mã nguồn chia tầng ra sao, tầng nào phụ thuộc tầng nào? |
| [Use case](use-cases.md) | Mỗi loại người dùng làm được những gì? |
| [Data flow](data-flow.md) | Dữ liệu đi từ API tới màn hình bằng những đường nào? |
| [State machine](state-machines.md) | Đơn hàng và thanh toán chuyển trạng thái thế nào? |

## Sơ đồ trong tài liệu khác

| Sơ đồ | Nằm ở |
| --- | --- |
| Tổng quan container | [Tổng quan kiến trúc](../02-architecture/overview.md) |
| Sequence: refresh phiên single-flight | [Phiên đăng nhập](../02-architecture/auth-session.md) |
| Activity: một request tới route riêng tư | [Routing và bảo vệ route](../02-architecture/routing-and-guards.md) |

## Sơ đồ trong các trang tính năng

Mỗi trang tính năng chứa sequence hoặc activity diagram đi kèm giải thích ngay bên dưới.

| Trang | Sơ đồ |
| --- | --- |
| [Auth](../04-features/auth.md) | Sequence đăng nhập; flowchart đặt lại mật khẩu |
| [Products](../04-features/products.md) | Sequence lọc sản phẩm; flowchart gợi ý tìm kiếm |
| [Cart](../04-features/cart.md) | Activity thêm vào giỏ; sequence đổi số lượng |
| [Checkout](../04-features/checkout.md) | Activity quy trình đặt hàng; sequence khôi phục sau sự cố |
| [Payments](../04-features/payments.md) | Sequence khách thanh toán và hệ thống xác nhận; flowchart màn hình theo trạng thái |
| [Orders](../04-features/orders.md) | Sequence hủy đơn; activity lối vào từ chi tiết đơn |
| [After-sales](../04-features/after-sales.md) | State machine vòng đời thiết bị; sequence tạo yêu cầu và thử lại |
| [Reviews](../04-features/reviews.md) | Flowchart điều kiện được đánh giá; sequence đồng bộ ảnh |
| [Wishlist](../04-features/wishlist.md) | Sequence thêm yêu thích khi chưa đăng nhập; state machine cảnh báo giá |
| [Admin](../04-features/admin.md) | Sequence các tầng truy cập; sequence chuyển trạng thái đơn |

Danh sách module và các tính năng chưa có tài liệu: [Danh sách module](../04-features/README.md).
