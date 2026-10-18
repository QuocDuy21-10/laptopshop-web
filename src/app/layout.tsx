import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { Providers } from "@/providers/Providers";
import "@/styles/globals.scss";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

// every page reads live API data; render per request so `next build` never needs the API
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "LaptopShop", template: "%s | LaptopShop" },
  description: "Laptop chính hãng, giá rõ ràng, thanh toán khi nhận hàng.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body>
        <a href="#main" className="skip-link">
          Bỏ qua tới nội dung chính
        </a>
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
