import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { AdvisorView } from "@/features/advisor/AdvisorView/AdvisorView";

export const metadata: Metadata = {
  title: "Tư vấn chọn laptop | LaptopShop",
  description: "Tìm laptop phù hợp với ngân sách, nhu cầu và cách bạn sử dụng máy.",
};

export default function AdvisorPage() {
  return (
    <Container>
      <section aria-labelledby="advisor-title">
        <h1 id="advisor-title">Tư vấn chọn laptop</h1>
        <p>Trả lời vài câu hỏi để tìm những mẫu laptop phù hợp với nhu cầu của bạn.</p>
      </section>
      <AdvisorView />
    </Container>
  );
}
