import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdvisorForm } from "@/features/advisor/AdvisorForm/AdvisorForm";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "../../utils";

const onSubmit = vi.fn();

beforeEach(() => vi.clearAllMocks());

const fillStepOne = async () => {
  await userEvent.type(screen.getByLabelText(/Ngân sách tối đa/), "20000000");
  await userEvent.click(screen.getByLabelText("Lập trình / CNTT"));
  await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
};

describe("AdvisorForm", () => {
  it("does not leave step one until budget and usage are valid", async () => {
    renderWithQuery(<AdvisorForm onSubmit={onSubmit} pending={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(screen.getByText("Bước 1/4")).toBeInTheDocument();
    expect(screen.getByText(/Ngân sách tối thiểu/)).toBeInTheDocument();
  });

  it("limits priorities to three and preserves values when going back", async () => {
    renderWithQuery(<AdvisorForm onSubmit={onSubmit} pending={false} />);
    await fillStepOne();
    expect(screen.getByText("Bước 2/4")).toBeInTheDocument();
    for (const label of ["Hiệu năng", "Mỏng nhẹ", "Pin lâu", "Màn hình"]) {
      await userEvent.click(screen.getByRole("checkbox", { name: label }));
    }
    expect(screen.getByText(/Chỉ chọn tối đa 3 ưu tiên/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.getByLabelText("Lập trình / CNTT")).toBeChecked();
    expect(screen.getByLabelText(/Ngân sách tối đa/)).toHaveValue("20.000.000");
  });

  it("fills the budget from a quick preset and shows a title per step", async () => {
    renderWithQuery(<AdvisorForm onSubmit={onSubmit} pending={false} />);
    expect(screen.getByRole("heading", { name: "Mục đích sử dụng và ngân sách" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đến 15 triệu" }));
    expect(screen.getByLabelText(/Ngân sách tối đa/)).toHaveValue("15.000.000");
    await userEvent.click(screen.getByLabelText("Lập trình / CNTT"));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(screen.getByRole("heading", { name: "Tiêu chí bạn ưu tiên nhất" })).toBeInTheDocument();
  });

  it("collects RAM, workloads and note, then submits once", async () => {
    renderWithQuery(<AdvisorForm onSubmit={onSubmit} pending={false} />);
    await fillStepOne();
    await userEvent.click(screen.getByRole("checkbox", { name: "Hiệu năng" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("radio", { name: "16 GB" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Docker / máy ảo" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.type(screen.getByLabelText("Yêu cầu thêm"), "Chạy Docker mỗi ngày");
    expect(screen.getByText("Chỉ dùng để cá nhân hóa lời tư vấn, không thay đổi thứ hạng.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nhận tư vấn" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      budgetMax: 20_000_000,
      usage: "CODING",
      priorities: ["PERFORMANCE"],
      minRamGb: 16,
      workloads: ["DOCKER_VM"],
      note: "Chạy Docker mỗi ngày",
    });
  });

  it("applies server field errors and keeps the form usable", async () => {
    renderWithQuery(
      <AdvisorForm
        onSubmit={onSubmit}
        pending={false}
        serverError={new ApiError(400, "VALIDATION_ERROR", "Validation failed", [{ path: "budgetMax", message: "bad" }])}
      />,
    );
    await waitFor(() => expect(screen.getByText("Giá trị không hợp lệ")).toBeInTheDocument());
    expect(screen.getByText("Bước 1/4")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables navigation while pending", () => {
    renderWithQuery(<AdvisorForm onSubmit={onSubmit} pending />);
    expect(screen.getByRole("button", { name: "Tiếp tục" })).toBeDisabled();
  });
});
