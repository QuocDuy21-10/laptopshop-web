# CI

Repo có hai workflow GitHub Actions trong [.github/workflows](https://github.com/QuocDuy21-10/laptopshop-web/tree/main/.github/workflows).

## CI chính (`ci.yml`)

[ci.yml](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/.github/workflows/ci.yml) chạy khi push lên `main` hoặc `develop`, và với mọi pull request.

| Bước | Lệnh |
| --- | --- |
| Cài đặt | `pnpm install --frozen-lockfile` (Node 22, cache pnpm) |
| Lint | `pnpm run lint` |
| Lint CSS | `pnpm run lint:css` |
| Kiểm tra kiểu | `pnpm run typecheck` |
| Test | `pnpm test` |
| Build | `pnpm run build` |

Phiên bản pnpm lấy từ trường `packageManager` trong `package.json`.

## Tài liệu (`docs.yml`)

[docs.yml](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/.github/workflows/docs.yml) liên quan đến site tài liệu này.

| Sự kiện | Việc làm |
| --- | --- |
| Pull request thay đổi `docs/**`, `package.json`, `pnpm-lock.yaml` hoặc chính workflow | Chạy `pnpm run docs:build`. Build thất bại nếu có liên kết nội bộ hỏng. |
| Push lên `main` với cùng các thay đổi | Build, rồi tải artifact và triển khai lên GitHub Pages |
| Chạy tay (`workflow_dispatch`) | Như push |

Để triển khai chạy được, cần bật GitHub Pages trong cài đặt repo: **Settings, Pages, Source: GitHub Actions**. Nếu chưa bật, job `deploy` nhiều khả năng sẽ lỗi (chưa chạy thử vì Pages chưa được bật); job build vẫn kiểm tra tài liệu. Địa chỉ site dự kiến: `https://quocduy21-10.github.io/laptopshop-web/`.

> [!WARNING]
> **Chưa xác minh:** địa chỉ Pages ở trên suy ra từ tên tài khoản và tên repo (`base: "/laptopshop-web/"` trong [config.mts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/docs/.vitepress/config.mts)); chưa kiểm tra vì Pages chưa được bật.

## CI không chứng minh điều gì

CI xanh cho thấy mã biên dịch, qua lint, qua unit test và build được. CI **không** chứng minh thanh toán trực tuyến, email, xử lý đồng thời tồn kho hay các tích hợp ngoài đã sẵn sàng cho production, vì test mock mọi tích hợp ([Kiểm thử](testing.md)).

## Cách tái hiện lỗi CI ở máy local

```bash
pnpm install --frozen-lockfile
pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test && pnpm build
```

Khi sửa tài liệu, thêm `pnpm docs:build`.

## Đọc tiếp

- [Kiểm thử](testing.md)
- [Quy trình làm việc](../08-development/workflow.md)
