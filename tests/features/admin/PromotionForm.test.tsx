import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PromotionForm } from "@/features/admin/promotions/PromotionForm";
import { renderAdmin } from "../../utils";

const mocks = vi.hoisted(() => ({ push: vi.fn(), mutate: vi.fn(), useAdminProducts: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/admin/promotions/hooks", () => ({ useCreatePromotion: () => ({ mutate: mocks.mutate, isPending: false, error: null }) }));
vi.mock("@/features/admin/products/hooks", () => ({ useAdminProducts: mocks.useAdminProducts }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useAdminProducts.mockImplementation((query: { q?: string }) => ({
    data: { data: query.q ? [{ id: 3, name: "Laptop Dell XPS" }] : [] },
  }));
});

const pickFlashSale = async () => {
  await userEvent.click(screen.getByRole("combobox", { name: "Loại" }));
  await userEvent.click(await screen.findByText("Flash Sale"));
};
const fillBasics = async () => {
  await userEvent.type(screen.getByLabelText("Tên chương trình"), "Flash cuối tuần");
  fireEvent.change(screen.getByLabelText("Bắt đầu"), { target: { value: "2026-11-01T10:00" } });
  fireEvent.change(screen.getByLabelText("Kết thúc"), { target: { value: "2026-11-01T12:00" } });
};

describe("PromotionForm flash sale", () => {
  it("blocks submit until a flash sale has a valid quota row", async () => {
    renderAdmin(<PromotionForm />);
    await pickFlashSale();
    await fillBasics();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
    expect(await screen.findByText("Cần ít nhất một sản phẩm Flash Sale.")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("creates a flash sale from a searched product with quota rows", async () => {
    renderAdmin(<PromotionForm />);
    await pickFlashSale();
    await fillBasics();
    await userEvent.click(screen.getByRole("button", { name: "Thêm sản phẩm" }));
    const select = screen.getByRole("combobox", { name: "Sản phẩm dòng 1" });
    await userEvent.click(select);
    await userEvent.type(select, "Laptop");
    await userEvent.click(await screen.findByText("Laptop Dell XPS"));
    fireEvent.change(screen.getByLabelText("Quota tổng dòng 1"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Tối đa mỗi user dòng 1"), { target: { value: "2" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));
    const body = mocks.mutate.mock.calls[0][0];
    expect(body).toMatchObject({
      kind: "FLASH_SALE",
      name: "Flash cuối tuần",
      startsAt: new Date("2026-11-01T10:00").toISOString(),
      endsAt: new Date("2026-11-01T12:00").toISOString(),
      flashSale: { items: [{ productId: 3, totalQuota: 10, maxUnitsPerUser: 2 }] },
    });
    expect(body.coupon).toBeUndefined();
  });
});
