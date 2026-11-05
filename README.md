<div align="center">

<img src="public/brand/logo-horizontal.svg" alt="Logo LaptopShop" width="280" />

# LaptopShop Web

**Chọn đúng laptop · So sánh tự tin · Mua sắm liền mạch**

Nền tảng thương mại điện tử chuyên biệt cho laptop và linh phụ kiện công nghệ.  
Xây dựng trên nền tảng **Next.js 16 (App Router)**, **React 19** và **TypeScript**.

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.4.2-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.3.1-149ECA?style=flat-square&logo=react&logoColor=white" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-11.24.0-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm" /></a>
  <a href="https://github.com/QuocDuy21-10/laptopshop-web/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/CI-passing-2EA44F?style=flat-square&logo=githubactions&logoColor=white" alt="CI" /></a>
  <a href="https://quocduy21-10.github.io/laptopshop-web/"><img src="https://img.shields.io/badge/Tài_liệu-GitHub_Pages-0A7EA4?style=flat-square&logo=readthedocs&logoColor=white" alt="Tài liệu" /></a>
</p>

---

<p align="center">
  <a href="#-tổng-quan-dự-án">Tổng quan</a> •
  <a href="#-tính-năng-chính">Tính năng</a> •
  <a href="#️-công-nghệ-sử-dụng">Công nghệ</a> •
  <a href="#-cấu-trúc-thư-mục">Cấu trúc</a> •
  <a href="#-bắt-đầu-nhanh">Bắt đầu nhanh</a> •
  <a href="#-lệnh-thường-dùng">Lệnh thường dùng</a> •
  <a href="#️-kiến-trúc--quy-ước-cốt-lõi">Kiến trúc</a> •
  <a href="#-tài-liệu--liên-kết">Tài liệu</a>
</p>

</div>

---

> [!NOTE]
> **Phạm vi repo:** Repo này chỉ chứa storefront cho khách hàng và giao diện quản trị (Frontend). Dữ liệu thực tế, API xác thực, cơ sở dữ liệu và thanh toán được cung cấp bởi repo riêng: [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api).

---

## 📌 Tổng quan dự án

**LaptopShop** giúp khách hàng tìm kiếm sản phẩm, đối chiếu thông số kỹ thuật chuẩn xác, nhận tư vấn cấu hình phù hợp và quản lý đơn hàng cùng yêu cầu sau bán trong một nền tảng đồng nhất. Trang quản trị riêng biệt phục vụ công tác vận hành bán lẻ hàng ngày.

---

## ✨ Tính năng chính

### 🛒 Storefront (Khách hàng)

| Nhóm tính năng | Chi tiết khả năng |
| :--- | :--- |
| **Khám phá & Bộ lọc** | Duyệt danh mục, tìm kiếm thông minh, lọc chi tiết theo CPU, RAM, GPU, kích thước màn hình, tầm giá và thương hiệu |
| **So sánh trực quan** | Đối chiếu thông số kỹ thuật song song giữa nhiều dòng máy |
| **Tư vấn chọn máy** | Hệ thống định hướng thông minh gợi ý cấu hình theo nhu cầu và ngân sách |
| **Giỏ hàng & Đặt hàng** | Checkout tinh gọn, hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản qua mã VietQR |
| **Khuyến mãi** | Mã giảm giá (voucher), chương trình ưu đãi và flash sale theo thời gian thực |
| **Đánh giá & Bình luận** | Đánh giá sao, nhận xét kèm ảnh từ người mua thực tế đã xác thực đơn |
| **Yêu thích & Thông báo** | Lưu sản phẩm quan tâm, bật cảnh báo khi có biến động giá hoặc có hàng trở lại |
| **Hậu mãi & Bảo hành** | Tra cứu lịch sử bảo hành thiết bị, gửi yêu cầu bảo hành hoặc hỗ trợ kỹ thuật trực tuyến |

### 🛡️ Admin Portal (Quản trị viên)

| Phân hệ | Trọng tâm vận hành |
| :--- | :--- |
| **Tổng quan** | Dashboard theo dõi doanh thu, số lượng đơn hàng và chỉ số vận hành thời gian thực |
| **Danh mục & Sản phẩm** | Quản lý sản phẩm, thông số kỹ thuật đa cấp, biến thể, hình ảnh và danh mục |
| **Khuyến mãi & Banner** | Quản lý chương trình ưu đãi, flash sale và banner quảng bá trên trang chủ |
| **Bán hàng & Thanh toán** | Quản lý vòng đời đơn hàng, cập nhật trạng thái giao nhận và đối soát thanh toán |
| **Quản lý kho** | Phiếu nhập kho, kiểm kê tồn kho và theo dõi nhật ký biến động kho |
| **Khách hàng & Chăm sóc** | Danh sách người dùng, kiểm duyệt đánh giá và xử lý phiếu hỗ trợ sau bán hàng |
| **Truyền thông** | Quản lý danh sách đăng ký nhận bản tin khuyến mãi (Newsletter) |

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server Components, Streaming SSR, Image Optimization |
| **Thư viện UI** | [React 19](https://react.dev/) | Xây dựng giao diện với kiến trúc React hiện đại |
| **Ngôn ngữ** | [TypeScript 5.9](https://www.typescriptlang.org/) | Type-safety từ hợp đồng OpenAPI đến giao diện người dùng |
| **Giao diện Storefront** | SCSS Modules + Design Tokens | Tùy biến linh hoạt qua CSS variables (`var(--color-*)`), chuẩn hóa giao diện |
| **Giao diện Admin** | [Ant Design 6](https://ant.design/) | Bộ component quản trị đồng nhất, tối ưu năng suất vận hành |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query) | Quản lý server state phía client, auto-caching, invalidate & refetch |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Xử lý form mượt mà và validate dữ liệu đồng bộ |
| **Icons & Motion** | [Lucide React](https://lucide.dev/) + [Motion](https://motion.dev/) | Bộ icon tối giản và hiệu ứng chuyển động mượt mà |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Unit testing toàn diện, mock network/Prisma độc lập |
| **Tài liệu** | [VitePress](https://vitepress.dev/) + Mermaid | Hệ thống tài liệu kỹ thuật tĩnh triển khai GitHub Pages |

---

## 📂 Cấu trúc thư mục

```text
laptopshop-web/
├── docs/                   # Nguồn tài liệu VitePress (tiếng Việt)
├── public/                 # Static assets (logo, icons, illustrations)
├── scripts/                # Script tự động hóa và kiểm tra docs
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, route handlers)
│   │   ├── (admin)/        # Phân hệ Admin portal
│   │   └── (storefront)/   # Phân hệ Storefront mua sắm
│   ├── components/         # Common UI components dùng chung (Buttons, Inputs, Modals)
│   ├── features/           # Module nghiệp vụ chuyên biệt (auth, cart, products, admin, ...)
│   ├── lib/                # API client, server fetching, query-keys, utilities
│   ├── providers/          # React context providers (QueryClient, AntD Registry, Theme)
│   ├── styles/             # Design tokens (_tokens.scss), mixins và styles toàn cục
│   └── proxy.ts            # Xử lý route bảo vệ và chuyển hướng xác thực
├── package.json
└── tsconfig.json
```

---

## 🚀 Bắt đầu nhanh

### Yêu cầu tiên quyết

- **Node.js**: Phiên bản `22`
- **pnpm**: Phiên bản `11.24.0`
- **Backend API**: Repo [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api) đang khởi chạy ở máy local (mặc định cổng `8080`).

### Cài đặt và khởi chạy

```bash
# 1. Clone repository
git clone https://github.com/QuocDuy21-10/laptopshop-web.git
cd laptopshop-web

# 2. Cài đặt dependencies
corepack enable
pnpm install --frozen-lockfile

# 3. Chuẩn bị biến môi trường
cp .env.example .env.local

# 4. Khởi chạy máy chủ phát triển
pnpm dev
```

Mở `.env.local` và kiểm tra giá trị của `API_ORIGIN`:

```dotenv
API_ORIGIN=http://localhost:8080
```

> [!WARNING]
> `.env.example` để `API_ORIGIN=` trống. Zod validation sẽ báo lỗi `Invalid URL` nếu biến này mang giá trị chuỗi rỗng. Hãy điền giá trị `http://localhost:8080` hoặc xóa dòng đó để nhận giá trị mặc định.

Sau khi khởi chạy:

- Truy cập storefront tại: [http://localhost:3000](http://localhost:3000)
- Truy cập trang quản trị tại: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 💻 Lệnh thường dùng

| Nhóm | Lệnh | Tác dụng |
| :--- | :--- | :--- |
| **Phát triển** | `pnpm dev` | Khởi chạy Next.js dev server trên cổng 3000 |
| **Build & Run** | `pnpm build` | Build ứng dụng cho môi trường production |
| | `pnpm start` | Khởi chạy bản build production |
| **Kiểm tra mã nguồn** | `pnpm lint` | Kiểm tra cú pháp và quy tắc bằng ESLint |
| | `pnpm lint:css` | Kiểm tra style SCSS bằng Stylelint |
| | `pnpm typecheck` | Sinh type của Next.js và kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| | `pnpm format` | Tự động định dạng toàn bộ mã nguồn với Prettier |
| **Kiểm thử** | `pnpm test` | Chạy toàn bộ unit test với Vitest |
| | `pnpm test:watch` | Chạy unit test ở chế độ theo dõi file (watch mode) |
| **Tài liệu & API** | `pnpm gen:api` | Tự động sinh `src/lib/api/schema.d.ts` từ OpenAPI specification |
| | `pnpm docs:dev` | Chạy máy chủ tài liệu cục bộ (VitePress) |
| | `pnpm docs:build` | Dựng bản phát hành tĩnh cho tài liệu |
| | `pnpm docs:check` | Kiểm tra tính toàn vẹn liên kết, sơ đồ Mermaid và bảo mật docs |

---

## 🏛️ Kiến trúc & Quy ước cốt lõi

- **Server Components vs. Client State:**
  - Danh mục sản phẩm công khai (`/`, `/products`, `/products/[id]`) được render dưới dạng **Server Components** kết hợp cache API qua `src/lib/api/server.ts` để tối ưu SEO và thời gian phản hồi.
  - Dữ liệu định danh người dùng (giỏ hàng, đơn hàng, tài khoản, thanh toán) chạy hoàn toàn phía client với **TanStack Query** qua `src/lib/api/client.ts`.
- **Cơ chế Token Refresh tập trung:**
  - Token refresh được điều phối độc quyền thông qua hàm `refreshSession()`. Tuyệt đối không tạo cơ chế refresh thứ hai để tránh race-condition khiến session bị thu hồi phía backend.
- **Hệ thống Styling & Tokens:**
  - Giao diện Storefront tuân thủ nghiêm ngặt quy định: chỉ sử dụng màu sắc thông qua CSS Variables `var(--color-*)` được định nghĩa trong `src/styles/_tokens.scss`. Không sử dụng CSS-in-JS, Tailwind hay mã màu hex tự do.
  - Thư viện **Ant Design** chỉ được sử dụng trong phạm vi phân hệ `/admin`.
- **Chính sách kiểm thử (Unit Testing Only):**
  - Dự án chỉ duy trì unit test với mock data độc lập. Không tích hợp kiểm thử tích hợp (integration) hay kiểm thử đầu cuối (E2E) truy cập DB/Redis thật.

---

## 📖 Tài liệu & Liên kết

| Mục đích | Tài liệu tham khảo |
| :--- | :--- |
| 🌐 **Tài liệu trực tuyến** | [quocduy21-10.github.io/laptopshop-web](https://quocduy21-10.github.io/laptopshop-web/) |
| 📐 **Hệ thống thiết kế (Design System)** | [DESIGN.md](DESIGN.md) |
| 🤖 **Quy chuẩn dành cho AI Agent** | [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) |
| 🚀 **Hướng dẫn cài đặt chi tiết** | [docs/00-getting-started/setup.md](docs/00-getting-started/setup.md) |
| 🏗️ **Tổng quan kiến trúc** | [docs/02-architecture/overview.md](docs/02-architecture/overview.md) |
| 📦 **Danh sách module tính năng** | [docs/04-features/README.md](docs/04-features/README.md) |
| 🚢 **Quy trình triển khai (Deployment)** | [docs/10-operations/deployment.md](docs/10-operations/deployment.md) |
| 💻 **Backend Repository** | [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api) |

---

<div align="center">

[⬆ Về đầu trang](#laptopshop-web)

<br/>

<sub>© LaptopShop Team. Xây dựng vì trải nghiệm mua sắm laptop minh bạch và chuẩn xác.</sub>

</div>
