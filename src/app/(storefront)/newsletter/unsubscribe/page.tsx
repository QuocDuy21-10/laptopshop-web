import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { NewsletterTokenAction } from "@/features/newsletter/NewsletterTokenAction/NewsletterTokenAction";

// the token is a one-time secret in the URL: keep the page out of search results and out of Referer headers
export const metadata: Metadata = {
  title: "Hủy đăng ký nhận ưu đãi",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<{ token?: string | string[] }> };

export default async function NewsletterUnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <Page title="Hủy đăng ký nhận ưu đãi">
      <NewsletterTokenAction action="unsubscribe" token={typeof token === "string" ? token : undefined} />
    </Page>
  );
}
