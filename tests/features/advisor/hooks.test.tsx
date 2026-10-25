import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { useAdvisor } from "@/features/advisor/hooks";
import { json, lastRequest, mockFetch, renderWithQuery, urlOf } from "../../utils";

const input = {
  budgetMax: 20_000_000,
  usage: "CODING" as const,
  priorities: [],
  workloads: [],
};

function Harness() {
  const advisor = useAdvisor();
  const controller = useRef(new AbortController());
  return (
    <>
      <button type="button" onClick={() => advisor.mutate({ input, signal: controller.current.signal })}>
        Gửi
      </button>
      <button type="button" onClick={() => controller.current.abort()}>Hủy</button>
      {advisor.isSuccess && <div role="status">{advisor.data.data.mode}</div>}
      {advisor.isError && <div role="status">{(advisor.error as { code?: string }).code}</div>}
    </>
  );
}

describe("useAdvisor", () => {
  beforeEach(() => mockFetch());

  it("posts structured preferences and unwraps the result", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { mode: "rule_based", recommendations: [], suggestions: [] } }));
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    expect(await screen.findByRole("status")).toHaveTextContent("rule_based");
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("POST");
    expect(urlOf(request)).toContain("/api/v1/advisor/recommend");
    expect(await request.json()).toEqual(input);
  });

  it("surfaces API errors through ApiError", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(429, { error: { code: "RATE_LIMITED", message: "slow down" } }));
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("RATE_LIMITED"));
  });

  it("passes and aborts the caller-owned signal", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    const request = lastRequest(fetchMock);
    expect(request.signal.aborted).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(request.signal.aborted).toBe(true);
  });
});
