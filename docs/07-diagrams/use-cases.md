# Use case

Sơ đồ nhóm các use case theo actor. Mỗi use case ứng với ít nhất một route có thật trong `src/app`.

```mermaid
flowchart LR
    guest(["Khách vãng lai"])
    member(["Thành viên"])
    admin(["Quản trị viên"])

    subgraph browse["Duyệt sản phẩm"]
        u1["Xem trang chủ"]
        u2["Tìm và lọc laptop"]
        u3["Xem chi tiết, đánh giá"]
        u4["So sánh laptop"]
        u5["Nhờ tư vấn chọn máy"]
        u6["Xem khuyến mãi"]
    end

    subgraph buy["Mua hàng"]
        u7["Quản lý giỏ hàng"]
        u8["Lưu yêu thích"]
        u9["Đặt hàng"]
        u10["Thanh toán chuyển khoản"]
        u11["Theo dõi, hủy đơn"]
    end

    subgraph acct["Tài khoản và hậu mãi"]
        u12["Đăng ký, đăng nhập"]
        u13["Sửa hồ sơ"]
        u14["Nhận thông báo"]
        u15["Bảo hành, yêu cầu hậu mãi"]
    end

    subgraph ops["Quản trị"]
        u16["Xem tổng quan"]
        u17["Quản lý sản phẩm, khuyến mãi, banner"]
        u18["Xử lý đơn và thanh toán"]
        u19["Quản lý kho"]
        u20["Quản lý người dùng, đánh giá"]
        u21["Xử lý hậu mãi, thông báo, bản tin"]
    end

    guest --> u1 & u2 & u3 & u4 & u5 & u6 & u12
    member --> u7 & u8 & u9 & u10 & u11 & u13 & u14 & u15
    member -.->|"kế thừa"| guest
    admin --> u16 & u17 & u18 & u19 & u20 & u21
```

### Ánh xạ use case sang route

| Use case | Route | Cần đăng nhập |
| --- | --- | --- |
| Xem trang chủ | `/` | Không |
| Tìm và lọc laptop | `/products` | Không |
| Xem chi tiết, đánh giá | `/products/[id]` | Không |
| So sánh laptop | `/compare` | Không |
| Nhờ tư vấn chọn máy | `/advisor` | Không |
| Xem khuyến mãi | `/promotions` | Không |
| Đăng ký, đăng nhập, quên mật khẩu | `/register`, `/login`, `/forgot-password` | Không |
| Quản lý giỏ hàng | `/cart` | Có |
| Lưu yêu thích | `/wishlist` | Có |
| Đặt hàng | `/checkout` | Có |
| Thanh toán chuyển khoản | `/account/orders/[id]/payment` | Có |
| Theo dõi, hủy đơn | `/account/orders`, `/account/orders/[id]` | Có |
| Sửa hồ sơ | `/account` | Có |
| Nhận thông báo | `/account/notifications`, `/account/notifications/settings` | Có |
| Bảo hành, hậu mãi | `/account/warranties`, `/account/after-sales` | Có |
| Quản trị (các use case 16 đến 21) | `/admin/*` | Có, kèm role `ADMIN` |

### Ghi chú

- "Thành viên kế thừa khách" nghĩa là người đã đăng nhập vẫn dùng được mọi chức năng công khai.
- Thêm vào giỏ hoặc yêu thích khi chưa đăng nhập mở hộp thoại mời đăng nhập, rồi tiếp tục thao tác sau khi đăng nhập ([routing](../02-architecture/routing-and-guards.md)).
- Trang quản trị chỉ mô tả ở mức nhóm; chi tiết ở [Admin](../04-features/admin.md).
- Danh sách đầy đủ route: [Danh sách route](../12-reference/routes.md).

## Đọc tiếp

- [Danh sách module](../04-features/README.md)
- [LaptopShop là gì](../01-product/overview.md)
