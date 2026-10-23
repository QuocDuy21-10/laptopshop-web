import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceQuoteEditor } from "@/features/admin/after-sales/ServiceQuoteEditor";
import { renderAdmin } from "../../../utils";

vi.mock("@/features/admin/after-sales/hooks", () => ({ useSendAfterSalesQuote: () => ({ mutate: vi.fn(), isPending: false }) }));

describe("Admin ServiceQuoteEditor", () => {
  it("shows quote action for technical support", () => {
    renderAdmin(<ServiceQuoteEditor requestId={90} itemId={2} expectedVersion={1} deviceLabel="Thiết bị 2" />);
    expect(screen.getByRole("button", { name: "Gửi báo giá Thiết bị 2" })).toBeEnabled();
  });
});
