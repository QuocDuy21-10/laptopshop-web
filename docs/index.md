---
layout: home
hero:
  name: LaptopShop Web
  text: Tài liệu kỹ thuật và nghiệp vụ
  tagline: Storefront và trang quản trị Next.js của LaptopShop
  actions:
    - theme: brand
      text: Bắt đầu
      link: /00-getting-started/setup
    - theme: alt
      text: Kiến trúc
      link: /02-architecture/overview
features:
  - title: Tôi muốn hiểu LaptopShop
    details: Sản phẩm làm gì, cho ai, hành trình mua hàng. Không cần biết lập trình.
    link: /01-product/overview
  - title: Tôi là developer mới
    details: Cài đặt, kiến trúc và quy trình đóng góp, theo thứ tự đọc đề xuất.
    link: /00-getting-started/setup
  - title: Tôi cần tra cứu
    details: API, data dictionary, route và business rules của từng module.
    link: /04-features/README
---

## Thứ tự đọc cho developer mới

1. [Cài đặt và chạy](/00-getting-started/setup): chạy được ứng dụng ở máy local.
2. [Tổng quan kiến trúc](/02-architecture/overview): các phần của hệ thống và ranh giới frontend, backend.
3. [Rendering và cache](/02-architecture/rendering-and-caching): khi nào dùng Server Component, khi nào dùng TanStack Query.
4. [Phiên đăng nhập](/02-architecture/auth-session): cookie và cơ chế làm mới phiên.
5. [Lớp gọi API](/06-api-and-data/api-layer): cách gọi API và xử lý lỗi.
6. [Đóng góp lần đầu](/00-getting-started/first-contribution): một thay đổi nhỏ từ đầu đến cuối.

## Phạm vi

Repo này là **frontend**. Backend nằm ở [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api); cấu trúc cơ sở dữ liệu, bảng và ràng buộc thuộc về backend nên tài liệu chỉ dẫn tới đó. Các điểm chưa xác minh được đánh dấu rõ và gom ở [Lộ trình tài liệu](/12-reference/roadmap).
