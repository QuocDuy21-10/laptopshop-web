import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "LaptopShop", template: "%s | LaptopShop" },
  description: "Laptop chính hãng, giá rõ ràng, thanh toán khi nhận hàng.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
