<div align="center">

<img src="public/brand/logo-horizontal.svg" alt="Logo LaptopShop" width="250" />

# LaptopShop

**Chọn đúng laptop. So sánh tự tin. Mua sắm liền mạch.**

Giao diện thương mại điện tử laptop xây dựng bằng **Next.js 16**, **React 19** và **TypeScript**: từ khám phá sản phẩm, tư vấn chọn máy đến đặt hàng, thanh toán và hậu mãi.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.1-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://github.com/QuocDuy21-10/laptopshop-web/actions/workflows/ci.yml/badge.svg)](https://github.com/QuocDuy21-10/laptopshop-web/actions/workflows/ci.yml)

<img src="public/banners/hero-gaming.webp" alt="Banner laptop gaming của LaptopShop" width="100%" />

</div>

> **Phạm vi:** repo này chứa storefront cho khách hàng và giao diện quản trị. Backend nằm ở repo riêng [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api).

## Tài liệu

Toàn bộ tài liệu kỹ thuật và nghiệp vụ (kiến trúc, tính năng, API, data dictionary, sơ đồ, vận hành, bảo mật) nằm ở **[docs/README.md](docs/README.md)**.

| Bạn muốn | Đọc |
| --- | --- |
| Hiểu LaptopShop là gì | [LaptopShop là gì](docs/01-product/overview.md) |
| Chạy và đóng góp | [Cài đặt và chạy](docs/00-getting-started/setup.md) |
| Hiểu kiến trúc | [Tổng quan kiến trúc](docs/02-architecture/overview.md) |
| Tra cứu tính năng | [Danh sách module](docs/04-features/README.md) |
| Triển khai | [Triển khai](docs/10-operations/deployment.md) |
| Hệ thống thiết kế | [DESIGN.md](DESIGN.md) |

## Giới thiệu

**LaptopShop** giúp khách hàng tìm sản phẩm, đánh giá thông số kỹ thuật, quyết định mua và quản lý đơn hàng cùng yêu cầu sau bán trong một nơi. Trang quản trị riêng phục vụ vận hành cửa hàng hằng ngày.

## Tính năng

### Storefront

| Nhóm | Khả năng |
| --- | --- |
| Khám phá sản phẩm | Duyệt, xem chi tiết, tìm kiếm và lọc theo thông số |
| So sánh | So sánh thông số nhiều laptop |
| Tư vấn chọn máy | Gợi ý laptop theo ngân sách và nhu cầu |
| Yêu thích | Lưu sản phẩm, cảnh báo giá |
| Mua hàng | Giỏ hàng, đặt hàng, thanh toán khi nhận hàng hoặc chuyển khoản QR |
| Khuyến mãi | Mã giảm giá, chương trình khuyến mãi, flash sale |
| Đánh giá | Đọc và viết đánh giá sản phẩm |
| Tài khoản | Đăng nhập, hồ sơ, đơn hàng, thông báo |
| Hậu mãi | Xem quyền lợi bảo hành, gửi yêu cầu bảo hành hoặc hỗ trợ |
| Bản tin | Đăng ký nhận ưu đãi qua email |

### Quản trị

| Module | Trọng tâm |
| --- | --- |
| Tổng quan | Số liệu vận hành cửa hàng |
| Danh mục và khuyến mãi | Sản phẩm, chương trình khuyến mãi, banner trang chủ |
| Bán hàng và thanh toán | Đơn hàng, đối soát thanh toán |
| Kho | Nhật ký kho, phiếu nhập, điều chỉnh tồn kho |
| Khách hàng | Người dùng, đánh giá |
| Chăm sóc khách hàng | Hậu mãi, thông báo |
| Truyền thông | Quản lý bản tin |

> Các nhóm trên phản ánh route và module hiện có. Khả năng vận hành thực tế còn phụ thuộc cấu hình backend và tích hợp bên ngoài; bảng này không bảo đảm sẵn sàng cho production.

## Bắt đầu nhanh

Cần **Node.js 22**, **pnpm 11.24.0** và [backend](https://github.com/QuocDuy21-10/laptopshop-api) đang chạy.

```bash
git clone https://github.com/QuocDuy21-10/laptopshop-web.git
cd laptopshop-web
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local   # điền API_ORIGIN, ví dụ http://localhost:8080
pnpm dev                     # http://localhost:3000
```

Chi tiết và các lỗi thường gặp ở [Cài đặt và chạy](docs/00-getting-started/setup.md). Không commit `.env.local` hay thông tin bí mật.

## Lệnh thường dùng

| Lệnh | Tác dụng |
| --- | --- |
| `pnpm dev` | Chạy môi trường phát triển |
| `pnpm build` / `pnpm start` | Build và chạy production |
| `pnpm lint` / `pnpm lint:css` | Kiểm tra ESLint và Stylelint |
| `pnpm typecheck` | Sinh type của Next và chạy TypeScript |
| `pnpm test` / `pnpm test:watch` | Chạy Vitest |
| `pnpm gen:api` | Sinh lại `schema.d.ts` từ OpenAPI ([hướng dẫn](docs/08-development/regenerate-api-types.md)) |
| `pnpm docs:dev` / `pnpm docs:build` | Chạy hoặc dựng site tài liệu |
| `pnpm format` | Định dạng bằng Prettier |

CI chạy lint, kiểm tra kiểu, test và build cho mọi pull request ([CI](docs/09-quality/ci.md)).

## Liên kết

- Backend: [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api)
- Hướng dẫn cho AI agent: [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md)
- Quy trình làm việc: [Quy trình làm việc](docs/08-development/workflow.md)
