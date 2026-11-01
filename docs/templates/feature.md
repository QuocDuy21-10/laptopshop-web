# Tên feature

Template cho trang tài liệu feature trong `docs/04-features/`. Sao chép file này, đổi tên theo module (ví dụ `cart.md`), xóa các comment `<!-- -->` sau khi viết xong.

Quy tắc chung:

- Giữ nguyên 13 heading dưới đây theo đúng thứ tự để các trang feature đọc giống nhau.
- Mục nào không áp dụng thì ghi `Không áp dụng: <lý do>`, không xóa heading.
- Mọi khẳng định kỹ thuật phải truy về được file nguồn. Điều chưa kiểm chứng được thì đánh dấu:

```md
> [!WARNING]
> **Chưa xác minh:** <nội dung>. <cần kiểm tra ở đâu>.
```

## Tổng quan

<!-- 2-4 câu: feature làm gì, vì sao tồn tại, nằm ở đâu trong storefront hay admin. -->

## Actors và use cases

<!-- Bảng: Actor | Use case | Route. Actor: Khách vãng lai, Thành viên, Admin. -->

| Actor | Use case | Route |
| --- | --- | --- |
|  |  |  |

## Hành trình người dùng

<!-- Danh sách đánh số các bước người dùng thấy, từ điểm vào đến kết quả. -->

## Luồng nghiệp vụ

<!-- Frontend làm gì, backend làm gì ở từng bước. Ghi rõ phần nào do backend quyết định. -->

## Business rules

<!-- Bảng: Quy tắc | Do ai thực thi (web/API) | Nguồn. Chỉ ghi quy tắc có trong code. -->

| Quy tắc | Thực thi bởi | Nguồn |
| --- | --- | --- |
|  |  |  |

## Sơ đồ

<!-- Ít nhất một sequence diagram hoặc activity diagram (flowchart) bằng Mermaid, kèm đoạn giải thích bằng lời: thành phần, đường đi dữ liệu, nhánh lỗi. -->

## API requests/responses

<!-- Chỉ liệt kê endpoint frontend thực sự gọi. Path lấy từ src/lib/api/schema.d.ts. -->

| Method | Path | Auth | Request | Response | Lỗi thường gặp |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Data contracts

<!-- Tóm tắt type quan trọng và link sang data dictionary tương ứng. Không chép lại cả bảng. -->

## UI states và xử lý lỗi

<!-- Loading, empty, error, retry, thành công. Lỗi API đi qua errorMessage (lib/api/errors.ts) và applyFieldErrors (lib/forms.ts). -->

## Edge cases

<!-- Các tình huống biên đã xác minh trong code hoặc test. -->

## Bảo mật

<!-- Xác thực, phân quyền, dữ liệu nhạy cảm, những gì chỉ backend được quyết định. -->

## Tham chiếu mã nguồn

<!-- Link GitHub kèm số dòng: https://github.com/QuocDuy21-10/laptopshop-web/blob/main/<path>#L<a>-L<b> -->

## Tài liệu liên quan

<!-- Link tương đối tới trang docs khác. -->
