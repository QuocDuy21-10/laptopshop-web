# Quy ước

Quy ước cho code và cho tài liệu trong repo. Phần code chỉ tóm tắt; nguồn chuẩn là [AGENTS.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/AGENTS.md) và [DESIGN.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/DESIGN.md).

## Code

| Chủ đề | Quy ước |
| --- | --- |
| Thành phần React | Server Component mặc định; chỉ thêm `"use client"` khi cần tương tác. |
| Dữ liệu catalog công khai | Server Component gọi `src/lib/api/server.ts`. |
| Dữ liệu theo người dùng | Hook TanStack Query gọi `src/lib/api/client.ts`. |
| Query key | Chỉ lấy từ `src/lib/api/query-keys.ts`. |
| Lỗi API | Đi qua `errorMessage` và `applyFieldErrors` trong `src/lib/api/errors.ts`. |
| Refresh phiên | Chỉ dùng `refreshSession()`; không viết đường refresh thứ hai. |
| Màu | Chỉ qua biến `var(--color-*)`. Stylelint chặn mã hex và tên màu ngoài `src/styles/_tokens.scss`. |
| Giá | Hiển thị bằng `formatVnd`. |
| Dữ liệu sản phẩm | Chỉ hiển thị những gì API trả về; không tự bịa đánh giá, giảm giá hay mức khan hiếm. |
| Ngôn ngữ giao diện | Tiếng Việt. |
| Ant Design | Chỉ dùng trong `src/app/(admin)` và `src/features/admin`. Storefront không dùng CSS-in-JS. |

Thứ tự `import` được ESLint kiểm tra ở mức cảnh báo: nhóm bên ngoài (package) trước, nhóm nội bộ (alias `@/` và đường dẫn tương đối) sau, cách nhau đúng một dòng trống; trong mỗi nhóm sắp theo độ dài đường dẫn tăng dần rồi A-Z. Chạy `eslint --fix` trên file bạn sửa. Quy tắc nằm ở [import-order-by-length.mjs](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/eslint-rules/import-order-by-length.mjs).

## Tổ chức thư mục feature

Mỗi module nằm trong `src/features/<module>/`. Cấu trúc thường gặp:

- `hooks.ts`: hook TanStack Query gọi API của module.
- `schema.ts` hoặc `schemas.ts`: schema Zod cho form.
- Thư mục theo component, trong đó file `.tsx` và `.module.scss` đặt cạnh nhau.

Test nằm riêng trong `tests/`, chia theo `components`, `features`, `lib` và `ui` (xem [Kiểm thử](../09-quality/testing.md)).

## Viết tài liệu

### Ngôn ngữ và giọng văn

- Viết tiếng Việt; giữ nguyên tên công nghệ, thuật ngữ chuyên môn, tên file và tên hàm.
- Giải thích thuật ngữ khi dùng lần đầu, hoặc link sang [Thuật ngữ](../01-product/glossary.md).
- Đoạn văn ngắn. Nội dung dài thì tách thành danh sách hoặc bảng.

### Cấu trúc trang

- Mỗi trang có đúng một H1; heading không nhảy cấp.
- Không dùng emoji trong heading.
- Dùng [template](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/docs/templates) khi viết trang feature, hợp đồng API, ADR hoặc runbook.

### Liên kết

| Loại | Cách viết |
| --- | --- |
| Giữa các trang docs | Đường dẫn tương đối có đuôi `.md`, ví dụ `../02-architecture/overview.md`. |
| Tới mã nguồn web | `https://github.com/QuocDuy21-10/laptopshop-web/blob/main/<path>#L<a>-L<b>`. |
| Tới mã nguồn backend | `https://github.com/QuocDuy21-10/laptopshop-api/blob/main/<path>`. |
| Tới file ở root repo | URL GitHub (VitePress không phục vụ file ngoài `docs/`). |
| Đường dẫn có dấu ngoặc, như `(admin)` | Mã hóa thành `%28` và `%29` trong URL, ví dụ `src/app/%28admin%29/admin/layout.tsx`. Nếu không, Markdown cắt liên kết ở dấu `)` đầu tiên. |
| Địa chỉ localhost | Viết dạng code (`http://localhost:3000`), không viết thành liên kết. |

### Đánh dấu điều chưa xác minh

Mọi khẳng định kỹ thuật phải truy về được file nguồn. Điều chưa kiểm chứng được thì không đoán, mà ghi như sau:

```md
> [!WARNING]
> **Chưa xác minh:** <nội dung>. <cần kiểm tra ở đâu>.
```

Callout dùng cú pháp GitHub alerts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`), hiển thị đúng trên cả GitHub lẫn site VitePress. Danh sách các mục chưa xác minh được gom trong [Lộ trình tài liệu](../12-reference/roadmap.md).

### Không lặp nội dung

- [DESIGN.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/DESIGN.md) là nguồn chuẩn về giao diện; docs chỉ tóm tắt và dẫn link.
- Cấu trúc cơ sở dữ liệu thuộc về backend; docs link sang [schema.prisma](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma) thay vì chép lại.

### Thêm một trang mới

1. Tạo file `.md` trong thư mục phù hợp của `docs/`.
2. Thêm trang vào `sidebar` trong `docs/.vitepress/config.mts`.
3. Chạy `pnpm docs:build` và kiểm tra trang hiển thị đúng.

### Xem site ở máy local

```bash
pnpm docs:dev
```

Site chạy ở `http://localhost:5173/laptopshop-web/`.
