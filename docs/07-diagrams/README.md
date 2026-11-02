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

Sequence và activity diagram của từng tính năng nằm trong trang tính năng tương ứng ở [Danh sách module](../04-features/README.md).
