import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const repo = "https://github.com/QuocDuy21-10/laptopshop-web";

const features = ["auth", "products", "cart", "checkout", "payments", "orders", "after-sales", "reviews", "wishlist", "promotions", "home", "notifications", "compare", "advisor", "account", "admin"] as const;
const featureTitle: Record<(typeof features)[number], string> = {
  auth: "Xác thực",
  products: "Sản phẩm",
  cart: "Giỏ hàng",
  checkout: "Thanh toán đơn (checkout)",
  payments: "Thanh toán (payments)",
  orders: "Đơn hàng",
  "after-sales": "Hậu mãi",
  reviews: "Đánh giá",
  wishlist: "Yêu thích",
  promotions: "Khuyến mãi",
  home: "Trang chủ",
  notifications: "Thông báo",
  compare: "So sánh",
  advisor: "Tư vấn",
  account: "Tài khoản",
  admin: "Quản trị",
};

export default withMermaid(
  defineConfig({
    lang: "vi-VN",
    title: "LaptopShop Web",
    description: "Tài liệu kỹ thuật và nghiệp vụ của storefront và trang quản trị LaptopShop",
    base: "/laptopshop-web/",
    cleanUrls: true,
    head: [["link", { rel: "icon", href: "/laptopshop-web/favicon.svg" }]],
    srcExclude: ["superpowers/**", "templates/**", "README.md"],
    themeConfig: {
      nav: [
        { text: "Bắt đầu", link: "/00-getting-started/setup" },
        { text: "Kiến trúc", link: "/02-architecture/overview" },
        { text: "Tính năng", link: "/04-features/README" },
        { text: "Tra cứu", link: "/12-reference/routes" },
      ],
      sidebar: [
        {
          text: "Bắt đầu",
          items: [
            { text: "Cài đặt và chạy", link: "/00-getting-started/setup" },
            { text: "Đóng góp lần đầu", link: "/00-getting-started/first-contribution" },
          ],
        },
        {
          text: "Sản phẩm",
          items: [
            { text: "LaptopShop là gì", link: "/01-product/overview" },
            { text: "Thuật ngữ", link: "/01-product/glossary" },
          ],
        },
        {
          text: "Kiến trúc",
          items: [
            { text: "Tổng quan", link: "/02-architecture/overview" },
            { text: "Rendering và cache", link: "/02-architecture/rendering-and-caching" },
            { text: "Phiên đăng nhập", link: "/02-architecture/auth-session" },
            { text: "Routing và bảo vệ route", link: "/02-architecture/routing-and-guards" },
          ],
        },
        { text: "Công nghệ", items: [{ text: "Tech stack", link: "/03-tech-stack/stack" }] },
        {
          text: "Tính năng",
          collapsed: false,
          items: [
            { text: "Danh sách module", link: "/04-features/README" },
            ...features.map((f) => ({ text: featureTitle[f], link: `/04-features/${f}` })),
          ],
        },
        {
          text: "UI/UX",
          items: [
            { text: "Hệ thống thiết kế", link: "/05-ui-ux/README" },
            { text: "Trạng thái và phản hồi", link: "/05-ui-ux/states-and-feedback" },
          ],
        },
        {
          text: "API và dữ liệu",
          items: [
            { text: "Lớp gọi API", link: "/06-api-and-data/api-layer" },
            { text: "Query keys", link: "/06-api-and-data/query-keys" },
            { text: "Xử lý lỗi API", link: "/06-api-and-data/errors" },
            {
              text: "Data dictionary",
              collapsed: true,
              items: [
                { text: "Cách đọc", link: "/06-api-and-data/data-dictionary/README" },
                ...features.map((f) => ({ text: featureTitle[f], link: `/06-api-and-data/data-dictionary/${f}` })),
              ],
            },
          ],
        },
        {
          text: "Sơ đồ",
          collapsed: true,
          items: [
            { text: "Chỉ mục sơ đồ", link: "/07-diagrams/README" },
            { text: "C4 System Context", link: "/07-diagrams/c4-context" },
            { text: "C4 Container", link: "/07-diagrams/c4-container" },
            { text: "Component frontend", link: "/07-diagrams/components" },
            { text: "Use case", link: "/07-diagrams/use-cases" },
            { text: "Data flow", link: "/07-diagrams/data-flow" },
            { text: "State machine", link: "/07-diagrams/state-machines" },
          ],
        },
        {
          text: "Phát triển",
          items: [
            { text: "Quy trình làm việc", link: "/08-development/workflow" },
            { text: "Quy ước", link: "/08-development/conventions" },
            { text: "Sinh lại API types", link: "/08-development/regenerate-api-types" },
          ],
        },
        {
          text: "Chất lượng",
          items: [
            { text: "Kiểm thử", link: "/09-quality/testing" },
            { text: "CI", link: "/09-quality/ci" },
          ],
        },
        {
          text: "Vận hành",
          items: [
            { text: "Triển khai", link: "/10-operations/deployment" },
            { text: "nginx và proxy", link: "/10-operations/nginx-and-proxy" },
            { text: "Runbook: API không truy cập được", link: "/10-operations/runbooks/api-unreachable" },
            { text: "Runbook: phiên bị thu hồi", link: "/10-operations/runbooks/session-revoked" },
            { text: "Runbook: gen:api thất bại", link: "/10-operations/runbooks/gen-api-fails" },
          ],
        },
        { text: "Bảo mật", items: [{ text: "Mô hình bảo mật", link: "/11-security/security-model" }] },
        {
          text: "Tra cứu",
          items: [
            { text: "Danh sách route", link: "/12-reference/routes" },
            { text: "Biến môi trường", link: "/12-reference/env-vars" },
            { text: "Lộ trình tài liệu", link: "/12-reference/roadmap" },
          ],
        },
      ],
      search: {
        provider: "local",
        options: { translations: { button: { buttonText: "Tìm kiếm", buttonAriaLabel: "Tìm kiếm" } } },
      },
      socialLinks: [{ icon: "github", link: repo }],
      editLink: { pattern: `${repo}/edit/main/docs/:path`, text: "Sửa trang này trên GitHub" },
      outline: { level: [2, 3], label: "Trên trang này" },
      docFooter: { prev: "Trang trước", next: "Trang sau" },
      darkModeSwitchLabel: "Giao diện",
      sidebarMenuLabel: "Mục lục",
      returnToTopLabel: "Lên đầu trang",
    },
  }),
);
