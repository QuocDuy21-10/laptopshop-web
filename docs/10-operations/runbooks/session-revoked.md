# Runbook: Người dùng bị đăng xuất ngẫu nhiên

## Triệu chứng

- Người dùng đang đăng nhập bỗng bị chuyển về `/login?next=...` mà không tự đăng xuất.
- Xảy ra khi nhiều yêu cầu chạy song song (mở nhiều tab, trang tải nhiều dữ liệu cùng lúc).
- Đăng nhập lại thì dùng được một lúc rồi lặp lại.

## Ảnh hưởng

Người dùng mất phiên; giỏ hàng và đơn hàng vẫn còn vì lưu ở backend, nhưng thao tác đang dở (ví dụ form checkout) có thể gián đoạn.

## Cơ chế gây ra

Backend xoay refresh token mỗi lần dùng. Nếu một refresh token đã bị thu hồi xuất hiện lại, backend coi đó là dấu hiệu bị đánh cắp và thu hồi toàn bộ chuỗi phiên ([token.service.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/auth/token.service.ts#L58-L82)). Hai lần làm mới chạy song song sẽ khiến lần thứ hai dùng token đã bị lần thứ nhất thu hồi ([chi tiết](../../02-architecture/auth-session.md#refresh-single-flight)). Frontend tránh điều này bằng `refreshSession()` dùng chung một Promise.

## Chẩn đoán

1. **Có đường làm mới thứ hai trong mã không?** Mọi lần gọi `/auth/refresh` chỉ được nằm trong `client.ts`:

   ```bash
   grep -rn "auth/refresh" src
   ```

   Kết quả mong đợi: chỉ có kết quả trong `src/lib/api/client.ts` (và tên endpoint trong `schema.d.ts`). Kết quả ở nơi khác là đường làm mới thừa cần gỡ.

2. **Có chỗ nào gọi `fetch` thô tới `/api/v1` không?**

   ```bash
   grep -rn "fetch(" src --include='*.ts' --include='*.tsx' | grep -v "src/lib/api/"
   ```

   Kết quả mong đợi: không có lời gọi tới `/api/v1` (trừ các tiện ích trong `src/lib/api`). Lời gọi thô bỏ qua `authFetch` nên không được làm mới phiên đúng cách.

3. **Test bảo vệ còn pass không?**

   ```bash
   pnpm vitest run tests/lib/client.test.ts
   ```

   Kết quả mong đợi: pass, gồm ca "shares one refresh between concurrent 401s".

4. **Hai tab, hai trình duyệt?** Mỗi tab chạy bản `refreshSession()` riêng nên hai tab cùng làm mới đồng thời vẫn có thể đụng nhau. Hiện chưa có cơ chế khóa liên tab trong mã.

> [!WARNING]
> **Chưa xác minh:** việc nhiều tab làm mới đồng thời có gây thu hồi phiên trong thực tế hay không. Biến `refreshing` nằm trong bộ nhớ của từng tab, và hàm `rotateRefreshToken` ở backend (dòng 58 đến 84) thu hồi cả chuỗi khi token bị dùng lại, không thấy khoảng chịu lỗi song song. Từ đó suy ra có thể xảy ra, nhưng chưa tái hiện được.

## Khắc phục

| Nguyên nhân | Cách sửa |
| --- | --- |
| Có đường làm mới thứ hai | Gỡ; chỉ dùng `refreshSession()` |
| Lời gọi `fetch` thô | Đổi sang `api` hoặc `sendMultipart` |
| Nhiều tab | Xem xét khóa liên tab (ví dụ Web Locks) trong một thay đổi riêng, kèm test |

## Phòng ngừa

- Giữ quy tắc "không thêm đường làm mới thứ hai" ([Quy ước](../../08-development/conventions.md)).
- Giữ test đồng thời trong `client.test.ts`.

## Liên quan

- [Phiên đăng nhập](../../02-architecture/auth-session.md)
- [Mô hình bảo mật](../../11-security/security-model.md)
