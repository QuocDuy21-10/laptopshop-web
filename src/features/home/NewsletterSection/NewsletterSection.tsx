import { NewsletterForm } from "@/features/newsletter/NewsletterForm/NewsletterForm";
import { HomeSection } from "../HomeSection/HomeSection";

export function NewsletterSection() {
  return (
    <HomeSection
      id="newsletter"
      title="Nhận ưu đãi qua email"
      subtitle="Đăng ký để nhận thông tin khuyến mãi mới từ LaptopShop."
    >
      <NewsletterForm />
    </HomeSection>
  );
}
