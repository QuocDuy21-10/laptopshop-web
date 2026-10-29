import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { AdvisorView } from "@/features/advisor/AdvisorView/AdvisorView";

export const metadata: Metadata = {
  title: "Tư vấn chọn laptop",
  description: "Tìm laptop phù hợp với ngân sách, nhu cầu và cách bạn sử dụng máy.",
};

export default function AdvisorPage() {
  return (
    <Page
      title="Tư vấn chọn laptop"
      titleId="advisor-title"
      description="Trả lời vài câu hỏi để tìm những mẫu laptop phù hợp với nhu cầu của bạn."
    >
      <AdvisorView />
    </Page>
  );
}
