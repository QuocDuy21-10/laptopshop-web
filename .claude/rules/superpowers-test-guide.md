# Hướng dẫn test local sau spec và plan superpowers

- Sau khi viết xong spec và plan bằng các skill superpowers, luôn viết thêm một file hướng dẫn test local bằng Markdown (tiếng Việt, cùng slug ngày-chủ đề với spec và plan) vào `docs/superpowers/test-guides/`, trong cùng commit.
- Hướng dẫn test từng bước trên giao diện local: cách chạy UI (và chạy `laptopshop-api` nếu cần), tài khoản dùng để đăng nhập, các trang/luồng cần thao tác, kết quả mong đợi.
- Phải bao gồm các trường hợp lỗi và trạng thái đặc biệt nêu trong spec (lỗi API, rỗng, chưa đăng nhập, không đủ quyền).
- Nếu thay đổi chỉ là backend (không có UI), hướng dẫn test qua Swagger UI tại `/api-docs` của `laptopshop-api`.
