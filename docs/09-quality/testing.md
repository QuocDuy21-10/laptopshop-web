# Kiểm thử

Repo chỉ dùng **unit test và component test**. Không có test tích hợp hay end-to-end.

## Chính sách

Theo [CLAUDE.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/CLAUDE.md) và [AGENTS.md](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/AGENTS.md), áp dụng cho cả `laptopshop-api` và `laptopshop-web`:

- Chỉ unit test, mọi mạng và cơ sở dữ liệu đều được mock; không dùng cơ sở dữ liệu, Redis hay kho lưu trữ thật.
- Không thêm: thư mục `tests/integration` hay `e2e/`, file `*.int.test.ts` hoặc `*.spec.ts`, cấu hình hay phụ thuộc Playwright, Cypress, script `test:int` hoặc `e2e`, và job CI tương ứng.

Quy định này giữ nguyên bất kể chỉ dẫn khác.

## Công cụ

| Thành phần | Chi tiết |
| --- | --- |
| Bộ chạy test | Vitest, môi trường `jsdom` ([vitest.config.mts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/vitest.config.mts)) |
| Component | React Testing Library, `user-event`, `jest-dom` |
| File được chạy | `tests/**/*.test.{ts,tsx}` |
| Thiết lập chung | [tests/setup.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/setup.ts) |
| Hàm hỗ trợ | [tests/utils.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/utils.tsx) |

`tests/setup.ts` làm ba việc: đặt cookie `logged_in=1` trước mỗi test (mô phỏng trình duyệt đã đăng nhập, để các test gọi `/users/me` hoạt động); dọn component và gỡ mọi `vi.stubGlobal` sau mỗi test; bổ sung `matchMedia` và `ResizeObserver` mà jsdom không có nhưng Ant Design cần.

## Hàm hỗ trợ

| Hàm | Dùng để |
| --- | --- |
| `renderWithQuery(ui)` | Render trong `QueryClientProvider` với `retry: false` |
| `renderAdmin(ui)` | Như trên, bọc thêm Ant Design `<App>` cho các component admin |
| `mockFetch()` | Thay `fetch` toàn cục bằng một mock |
| `json(status, body)` | Tạo `Response` JSON |
| `lastRequest(mock)` | Lấy đối tượng `Request` gần nhất (`openapi-fetch` gọi `fetch(Request)`) |
| `urlOf(input)` | Lấy URL từ đầu vào của `fetch` |
| `priceText(value)` | Chuỗi giá khớp truy vấn của Testing Library (khoảng trắng không ngắt dòng) |

## Cấu trúc thư mục `tests/`

| Thư mục | Nội dung |
| --- | --- |
| `tests/ui` | Thành phần dùng chung (`Button`, `TextField`, `Pagination`, `QuantityStepper`) |
| `tests/components` | Khung trang: header, footer, menu, giỏ mini |
| `tests/features` | Theo module: auth, giỏ hàng, checkout, sản phẩm, trang chủ, wishlist, hậu mãi...; thư mục con `admin` cho trang quản trị |
| `tests/lib` | Lớp API, lỗi, định dạng, an toàn |
| `tests/proxy.test.ts`, `tests/next-config.test.ts` | Proxy bảo vệ route và cấu hình Next |

## Viết một test

Mẫu ngắn nhất là [Button.test.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/ui/Button.test.tsx). Một test gọi API thường như sau:

1. `const fetchMock = mockFetch()` rồi `fetchMock.mockResolvedValue(json(200, { data: ... }))`.
2. `renderWithQuery(<Component />)`.
3. Dùng `screen` và `userEvent` để tương tác, `expect` để kiểm tra giao diện hoặc `lastRequest(fetchMock)` để kiểm tra yêu cầu đã gửi.

Ví dụ các hành vi quan trọng đã có test: làm mới phiên single-flight ([client.test.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/lib/client.test.ts)), khóa idempotency khi đặt hàng ([CheckoutForm.test.tsx](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/features/CheckoutForm.test.tsx)), chính sách cache phía server ([server-api.test.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/tests/lib/server-api.test.ts)).

## Chạy test

```bash
pnpm test                                     # chạy một lần
pnpm test:watch                               # chế độ theo dõi
pnpm vitest run tests/lib/client.test.ts      # một file
```

Trước khi push, chạy cả bộ: `pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test`.

## Giới hạn của unit test

Test mock mạng nên không chứng minh được rằng thanh toán trực tuyến, email, đồng thời tồn kho hay tích hợp bên thứ ba chạy đúng ở môi trường thật. Đây là ghi chú sẵn có trong README, được giữ lại ở [CI](ci.md).

## Đọc tiếp

- [CI](ci.md)
- [Đóng góp lần đầu](../00-getting-started/first-contribution.md)
