# Data dictionary: Advisor

Contract dữ liệu của module [Advisor](../../04-features/advisor.md). Cách đọc ở [README](README.md). Type response lấy từ `components["schemas"]` trong [schema.d.ts](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/lib/api/schema.d.ts#L10433-L10456).

## AdvisorRequest (cũng là kết quả của form)

Form kiểm tra bằng [advisorFormSchema](https://github.com/QuocDuy21-10/laptopshop-web/blob/main/src/features/advisor/schema.ts#L8-L23) (`strict`, không nhận field lạ); backend dùng cùng quy tắc ([advisor.schema.ts](https://github.com/QuocDuy21-10/laptopshop-api/blob/main/src/modules/advisor/advisor.schema.ts#L24-L40)).

| Field | Type | Bắt buộc | Ý nghĩa | Ràng buộc |
| --- | --- | --- | --- | --- |
| `budgetMax` | `number` | Có | Ngân sách tối đa (VND) | nguyên, 5.000.000 đến 200.000.000 |
| `usage` | `"CODING" \| "GAMING" \| "OFFICE" \| "CREATIVE"` | Có | Nhu cầu chính | |
| `priorities` | `Priority[]` | Có | Ưu tiên | tối đa 3, không trùng; `PERFORMANCE`, `PORTABILITY`, `BATTERY`, `DISPLAY`, `VALUE` |
| `minRamGb` | `8 \| 16 \| 32` | Không | RAM tối thiểu | chuỗi rỗng hoặc thiếu coi là không có |
| `workloads` | `Workload[]` | Không (mặc định rỗng) | Tác vụ | tối đa 5, không trùng; `DOCKER_VM`, `ESPORTS`, `AAA_GAMING`, `PHOTO_VIDEO`, `CAD_3D` |
| `note` | `string` | Không | Ghi chú tự do | tối đa 500 ký tự; rỗng coi như không có |

## AdvisorResult

| Field | Type | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- |
| `mode` | `"ai_enhanced" \| "rule_based"` | Nguồn lý do và đánh đổi | ghi chú khi `rule_based` |
| `recommendations` | `AdvisorRecommendation[]` | Tối đa 3 gợi ý | lưới thẻ |
| `suggestions` | `string[]` | Gợi ý nới tiêu chí khi không có kết quả; rỗng khi dùng AI | trạng thái rỗng |

## AdvisorRecommendation

| Field | Type | Ý nghĩa | Dùng ở UI |
| --- | --- | --- | --- |
| `product` | `PricedProduct` | Sản phẩm kèm giá hiệu lực | thẻ gợi ý, giá tư vấn |
| `matchScore` | `number` | Điểm 0 đến 100 | "Phù hợp N/100" |
| `highlights` | `string[]` | Điểm nổi bật | thẻ |
| `reason` | `string` | Lý do gợi ý | thẻ |
| `tradeoffs` | `string[]` | Đánh đổi; web hiện tối đa 2 | thẻ |

`matchScore` là điểm tham khảo từ tiêu chí và thông số, không phải benchmark (nhãn trên thẻ).
