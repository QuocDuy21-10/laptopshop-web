# Tài liệu LaptopShop Web

Tài liệu kỹ thuật và nghiệp vụ của storefront và trang quản trị LaptopShop (Next.js). Đọc trực tiếp trên GitHub, hoặc chạy site tài liệu ở máy local bằng `pnpm docs:dev`. Site còn được triển khai lên GitHub Pages bằng workflow `docs.yml` khi Pages được bật (xem [CI](09-quality/ci.md)).

Repo này là frontend. Backend ở [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api); cấu trúc cơ sở dữ liệu thuộc backend.

## Bạn là ai?

| Bạn là | Bắt đầu từ |
| --- | --- |
| Người không chuyên kỹ thuật, muốn hiểu LaptopShop | [LaptopShop là gì](01-product/overview.md), rồi [Thuật ngữ](01-product/glossary.md) |
| Developer mới | [Cài đặt và chạy](00-getting-started/setup.md), [Tổng quan kiến trúc](02-architecture/overview.md), [Đóng góp lần đầu](00-getting-started/first-contribution.md) |
| Developer cần tra cứu | [Danh sách module](04-features/README.md), [Data dictionary](06-api-and-data/data-dictionary/README.md), [Danh sách route](12-reference/routes.md) |

## Mục lục

| Thư mục | Trả lời câu hỏi |
| --- | --- |
| [00-getting-started](00-getting-started/setup.md) | Làm sao chạy và đóng góp lần đầu? |
| [01-product](01-product/overview.md) | LaptopShop là gì, ai dùng, thuật ngữ nghĩa là gì? |
| [02-architecture](02-architecture/overview.md) | Hệ thống tổ chức ra sao? Render, cache, phiên, bảo vệ route |
| [03-tech-stack](03-tech-stack/stack.md) | Dùng công nghệ gì, phiên bản nào, để làm gì? |
| [04-features](04-features/README.md) | Từng module làm gì, quy tắc nghiệp vụ, API, trạng thái giao diện |
| [05-ui-ux](05-ui-ux/README.md) | Hệ thống thiết kế, thành phần dùng chung, xử lý trạng thái |
| [06-api-and-data](06-api-and-data/api-layer.md) | Gọi API thế nào, query key, lỗi, data dictionary |
| [07-diagrams](07-diagrams/README.md) | C4, component, use case, data flow, state machine |
| [08-development](08-development/workflow.md) | Quy trình git, quy ước, sinh lại API types |
| [09-quality](09-quality/testing.md) | Kiểm thử và CI |
| [10-operations](10-operations/deployment.md) | Triển khai, nginx, runbook |
| [11-security](11-security/security-model.md) | Mô hình bảo mật |
| [12-reference](12-reference/routes.md) | Danh sách route, biến môi trường, lộ trình tài liệu |
| [templates](templates/feature.md) | Mẫu cho trang tính năng, hợp đồng API, ADR, runbook |

## Nguồn chuẩn ở nơi khác

Để tránh trùng lặp, tài liệu chỉ tóm tắt và dẫn tới các nguồn sau:

- Hệ thống thiết kế: [DESIGN.md](../DESIGN.md)
- Quy tắc cho AI agent: [CLAUDE.md](../CLAUDE.md), [AGENTS.md](../AGENTS.md)
- Cấu trúc cơ sở dữ liệu: [schema.prisma của backend](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/prisma/schema.prisma)

## Xem site tài liệu ở local

```bash
pnpm install
pnpm docs:dev      # http://localhost:5173/laptopshop-web/
pnpm docs:build    # kiểm tra liên kết nội bộ và dựng bản tĩnh
```

Quy ước viết tài liệu ở [Quy ước](08-development/conventions.md).
