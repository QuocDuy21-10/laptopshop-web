# Đóng góp lần đầu

Trang này đi qua một thay đổi nhỏ từ đầu đến cuối, để bạn biết các công cụ và quy ước của repo trước khi làm việc lớn hơn. Hãy [cài đặt và chạy](setup.md) dự án trước.

## 1. Tạo branch

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c fix/ten-thay-doi
```

Quy tắc đặt tên branch ở [Quy trình làm việc](../08-development/workflow.md).

## 2. Tìm đúng chỗ để sửa

Mã nguồn chia theo nghiệp vụ trong `src/features/<module>/`. Trang nằm ở `src/app`, thành phần giao diện dùng chung ở `src/components`.

| Bạn muốn sửa | Tìm ở |
| --- | --- |
| Trang và route | `src/app/(storefront)`, `src/app/(auth)`, `src/app/(admin)` |
| Logic và giao diện của một chức năng | `src/features/<module>/` |
| Nút, ô nhập, hộp thoại dùng chung | `src/components/ui/` |
| Gọi API, xử lý lỗi, query key | `src/lib/api/` |

Danh sách đầy đủ các route ở [Danh sách route](../12-reference/routes.md).

## 3. Sửa code

Giữ theo [quy ước](../08-development/conventions.md). Hai quy tắc dễ vi phạm nhất:

- Màu chỉ lấy từ biến `var(--color-*)`; Stylelint chặn mã hex.
- Dữ liệu từ API được hiển thị đúng như trả về, không tự thêm giảm giá hay đánh giá.

## 4. Viết hoặc cập nhật test

Chỉ viết unit test, đặt trong `tests/`. Test dùng Vitest, Testing Library và `fetch` được mock; repo không dùng test tích hợp hay E2E. Xem [Kiểm thử](../09-quality/testing.md). Mẫu ngắn nhất: [Button.test.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/ui/Button.test.tsx).

Chạy một file test:

```bash
pnpm vitest run tests/ui/Button.test.tsx
```

## 5. Chạy kiểm tra

```bash
pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test
```

## 6. Commit và mở PR

Commit theo kiểu conventional commits, ví dụ:

```text
fix(cart): keep quantity when the stock check fails
```

Sau đó push và mở PR vào `main`. CI chạy lại các bước kiểm tra và `pnpm build` ([CI](../09-quality/ci.md)).

## Đọc tiếp

- [Tổng quan kiến trúc](../02-architecture/overview.md)
- [Lớp gọi API](../06-api-and-data/api-layer.md)
