# Tech stack

Công nghệ dùng trong repo, phiên bản lấy từ [package.json](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/package.json) (đã ghim phiên bản chính xác). Cột cuối trỏ tới một file thật dùng công nghệ đó.

## Nền tảng

| Lớp | Công nghệ | Phiên bản | Dùng để làm gì | Ví dụ |
| --- | --- | --- | --- | --- |
| Framework | Next.js (App Router) | 16.4.2 | Routing, render server, rewrite, build standalone | [next.config.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/next.config.ts) |
| UI | React, React DOM | 19.3.1 | Thành phần giao diện | [Providers.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/providers/Providers.tsx) |
| Ngôn ngữ | TypeScript | 5.9.3 | Kiểm tra kiểu, chế độ `strict` | [tsconfig.json](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tsconfig.json) |
| Runtime | Node.js | 22 | Chạy build, dev và server production | [Dockerfile](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/Dockerfile) |
| Package manager | pnpm | 11.24.0 | Cài và khóa dependency | [pnpm-lock.yaml](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/pnpm-lock.yaml) |

## Dữ liệu và API

| Công nghệ | Phiên bản | Dùng để làm gì | Ví dụ |
| --- | --- | --- | --- |
| openapi-fetch | 0.16.0 | Client gọi API có kiểu theo `paths` | [client.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/client.ts) |
| openapi-typescript | 7.13.0 | Sinh `schema.d.ts` từ OpenAPI (`pnpm gen:api`) | [package.json](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/package.json) |
| TanStack Query | 5.104.4 | Lưu đệm dữ liệu phía client, mutation, invalidate | [Providers.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/providers/Providers.tsx) |
| server-only | 0.0.1 | Chặn import module chỉ dành cho server vào client | [server.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/server.ts) |

## Form và kiểm tra dữ liệu

| Công nghệ | Phiên bản | Dùng để làm gì | Ví dụ |
| --- | --- | --- | --- |
| React Hook Form | 7.90.0 | Quản lý trạng thái form | [LoginForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/LoginForm.tsx) |
| @hookform/resolvers | 5.9.2 | Nối Zod vào React Hook Form | [LoginForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/LoginForm.tsx) |
| Zod | 4.6.7 | Schema kiểm tra dữ liệu form và biến môi trường | [schemas.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/schemas.ts), [env.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/env.ts) |

## Giao diện

| Công nghệ | Phiên bản | Dùng để làm gì | Ví dụ |
| --- | --- | --- | --- |
| Sass (SCSS Modules) | 1.105.2 | Style theo từng component, dùng token ở `src/styles` | [Button](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/src/components/ui/Button) |
| Radix UI | Theo từng package (xem bên dưới) | Thành phần không kèm style, đảm bảo truy cập được | [Dialog.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/components/ui/Dialog/Dialog.tsx) |
| Lucide React | 1.59.0 | Bộ biểu tượng | [error.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/error.tsx) |
| Motion | 14.3.0 | Hiệu ứng chuyển động | [LoginForm.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/auth/LoginForm.tsx) |
| Sonner | 2.0.8 | Thông báo dạng toast | [Providers.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/providers/Providers.tsx) |
| Day.js | 1.11.23 | Xử lý ngày giờ | [SalesSection.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/dashboard/SalesSection.tsx) |

Các package Radix đang dùng: `react-checkbox` 1.4.1, `react-dialog` 1.3.1, `react-dropdown-menu` 2.2.1, `react-popover` 1.3.1.

### Chỉ dùng trong trang quản trị

| Công nghệ | Phiên bản | Dùng để làm gì | Ví dụ |
| --- | --- | --- | --- |
| Ant Design | 6.6.6 | Bảng, form, modal cho `/admin` | [AdminShell.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/AdminShell/AdminShell.tsx) |
| @ant-design/nextjs-registry | 1.3.0 | Gom style CSS-in-JS của Ant Design khi render server | [admin/layout.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/app/%28admin%29/admin/layout.tsx) |
| Recharts | 3.10.1 | Biểu đồ doanh số | [SalesChart.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/admin/dashboard/SalesChart.tsx) |

Quy tắc phạm vi: Ant Design (CSS-in-JS) chỉ được dùng trong `src/app/(admin)` và `src/features/admin`. Storefront dùng SCSS Modules và Radix, không dùng CSS-in-JS. Chi tiết ở [Quy ước](../08-development/conventions.md).

## Kiểm thử, lint và định dạng

| Công nghệ | Phiên bản | Dùng để làm gì |
| --- | --- | --- |
| Vitest | 5.0.5 | Chạy unit test ([vitest.config.mts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/vitest.config.mts)) |
| Testing Library (react 16.3.3, dom 10.4.2, jest-dom 7.0.1, user-event 14.6.8) | | Kiểm thử component |
| jsdom | 30.1.3 | Môi trường DOM cho test |
| ESLint | 10.13.0 | Lint TypeScript, kèm luật import order riêng ([eslint.config.mjs](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/eslint.config.mjs)) |
| Stylelint | 17.16.0 | Lint SCSS, cấm mã màu ngoài token ([stylelint.config.mjs](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/stylelint.config.mjs)) |
| Prettier | 3.9.10 | Định dạng code |

## Tài liệu

| Công nghệ | Phiên bản | Dùng để làm gì |
| --- | --- | --- |
| VitePress | 1.6.4 | Dựng site tài liệu từ thư mục `docs/` |
| vitepress-plugin-mermaid, Mermaid | 2.0.17, 11.17.2 | Hiển thị sơ đồ Mermaid |

## Đọc tiếp

- [Tổng quan kiến trúc](../02-architecture/overview.md)
- [Rendering và cache](../02-architecture/rendering-and-caching.md)
