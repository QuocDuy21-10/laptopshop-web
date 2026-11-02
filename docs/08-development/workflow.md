# Quy trình làm việc

Trang này mô tả cách đưa một thay đổi vào `main`: tạo branch, kiểm tra, commit và mở PR. Quy tắc gốc nằm trong [CLAUDE.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/CLAUDE.md) và [AGENTS.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/AGENTS.md); trang này chỉ tóm tắt để developer mới đi theo được.

## Bắt đầu một thay đổi

Mỗi tính năng hoặc bản sửa lỗi có branch riêng, luôn cắt từ `main` mới nhất. Không làm việc trực tiếp trên `main`.

```bash
git status                       # phải sạch; nếu không, xử lý trước khi tiếp tục
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feat/ten-thay-doi
```

Tên branch viết thường, nối bằng dấu gạch ngang, bắt đầu bằng một trong các tiền tố sau.

| Tiền tố | Dùng cho |
| --- | --- |
| `feat/` | Tính năng mới |
| `fix/` | Sửa lỗi |
| `refactor/` | Tái cấu trúc, không đổi hành vi |
| `perf/` | Cải thiện hiệu năng |
| `test/` | Chỉ thêm hoặc sửa test |
| `chore/` | Cấu hình, tooling, tài liệu |
| `hotfix/` | Sửa khẩn cấp |

## Trước khi push

Chạy đủ bốn lệnh; CI chạy lại chúng cùng `pnpm build` (xem [CI](../09-quality/ci.md)).

```bash
pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test
```

Nếu bạn sửa tài liệu, chạy thêm `pnpm docs:build`. Build thất bại khi có liên kết nội bộ hỏng.

## Commit và PR

- Dùng commit theo kiểu conventional commits, ví dụ `feat(header): collapse desktop navigation on downward scroll`.
- Commit và push thường xuyên; không force-push.
- Không thêm dòng `Co-Authored-By` hay ghi chú do AI tạo vào commit và mô tả PR.
- Không đọc hay commit file `.env*` (chỉ `.env.example` được commit).

## Đọc tiếp

- [Quy ước code và viết tài liệu](conventions.md)
- [Sinh lại API types](regenerate-api-types.md)
- [Kiểm thử](../09-quality/testing.md)
