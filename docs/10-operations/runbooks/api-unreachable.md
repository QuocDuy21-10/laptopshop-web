# Runbook: API không truy cập được

## Triệu chứng

- Trang danh mục, chi tiết sản phẩm hiện "Không tải được trang" kèm nút "Thử lại" ([error.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/error.tsx)).
- Trang chủ mất một số khối (banner, flash sale, đánh giá nổi bật) nhưng vẫn mở được.
- Các thao tác phía trình duyệt (giỏ hàng, đơn hàng) báo "Máy chủ đang gặp sự cố. Vui lòng thử lại sau." hoặc "Không thể kết nối máy chủ...".
- Ảnh sản phẩm (`/images/...`) không tải được.

## Ảnh hưởng

Mọi trang cần dữ liệu từ backend. Trang tĩnh (khung, đăng nhập) vẫn hiển thị nhưng không hoàn tất được thao tác.

## Chẩn đoán

1. **Backend có đang chạy không?** Thử endpoint sức khỏe trực tiếp tại `API_ORIGIN` (không qua nginx hay Next):

   ```bash
   curl -i "$API_ORIGIN/healthz"
   ```

   Kết quả mong đợi: HTTP 200. Endpoint `/healthz` nằm ở gốc backend ([health.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/routes/health.ts)), không nằm dưới `/api/v1`.

2. **API trả dữ liệu thật không?** Thử một endpoint công khai:

   ```bash
   curl -i "$API_ORIGIN/api/v1/products/filters"
   ```

   Kết quả mong đợi: HTTP 200 và JSON có `data`.

3. **Server Next có gọi đúng địa chỉ không?** Server Component dùng `API_ORIGIN` lúc chạy. Trong container `web`, kiểm tra biến:

   ```bash
   docker compose exec web printenv API_ORIGIN
   ```

   Kết quả mong đợi: địa chỉ backend đúng (ví dụ `http://app:8080`).

4. **Rewrite có trỏ đúng không?** Rewrite `/api/v1/*` và `/images/*` được biên dịch lúc build. Nếu `API_ORIGIN` lúc build khác địa chỉ backend hiện tại, trình duyệt gọi sai nơi dù biến runtime đúng. Kiểm tra build arg đã dùng ([Triển khai](../deployment.md)).

5. **nginx có chuyển đúng không?** Với production, thử qua nginx:

   ```bash
   curl -i "http://<địa-chỉ-site>/api/v1/products/filters"
   ```

   Kết quả mong đợi: giống bước 2. Nếu lỗi `502`, nginx không tới được `app:8080` ([nginx](../nginx-and-proxy.md)).

## Khắc phục

| Nguyên nhân | Cách sửa |
| --- | --- |
| Backend dừng hoặc chưa sẵn sàng | Khởi động lại backend; kiểm tra cơ sở dữ liệu và Redis mà nó phụ thuộc (xem tài liệu repo backend) |
| `API_ORIGIN` sai ở runtime | Sửa biến môi trường của `web` và khởi động lại |
| `API_ORIGIN` sai lúc build | Build lại image với `--build-arg API_ORIGIN=...` đúng |
| `API_ORIGIN` để trống | Đặt giá trị hợp lệ hoặc bỏ biến; chuỗi rỗng bị Zod từ chối ([Biến môi trường](../../12-reference/env-vars.md)) |
| nginx không tới được `app` | Kiểm tra tên service và mạng Docker; cấu hình `proxy_pass` |

## Phòng ngừa

- Truyền `API_ORIGIN` nhất quán cho cả build arg và biến runtime.
- Theo dõi `/healthz` của backend.
- Trang chủ đã cô lập lỗi từng khối ([Rendering và cache](../../02-architecture/rendering-and-caching.md)); các trang khác chưa có cơ chế tương tự, nên lỗi API làm trang lỗi.

## Liên quan

- [Cài đặt và chạy](../../00-getting-started/setup.md)
- [C4 Container](../../07-diagrams/c4-container.md)
