import { clearReviewImageSyncBudget } from "@/features/reviews/review-image-sync-budget";
import { File as NodeFile } from "node:buffer";
import { webcrypto } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";
import { screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { OwnerReview } from "@/lib/api/types";
import { ReviewDialog } from "@/features/reviews/ReviewDialog/ReviewDialog";
import {
  createPendingImageSync,
  readPendingImageSyncFor,
  savePendingImageSyncFor,
} from "@/features/reviews/pending-image-sync";
import { json, mockFetch, renderWithQuery } from "../../utils";
vi.mock("@/features/account/useMe", () => ({
  useMe: () => ({ data: { id: 7, fullName: "Khách QA" } }),
}));
const scope = { userId: 7, productId: 12, reviewId: 18 };
const owner: OwnerReview = {
  id: 18,
  productId: 12,
  rating: 5,
  title: null,
  content: "Nội dung đã lưu đủ dài.",
  isAnonymous: false,
  status: "PUBLISHED",
  deletedAt: null,
  imageVersion: 7,
  verifiedPurchase: true,
  images: [],
  createdAt: "2026-10-31T00:00:00Z",
  updatedAt: "2026-10-31T00:00:00Z",
};
const eligibility = {
  eligible: false,
  reason: "ALREADY_REVIEWED" as const,
  existingReview: owner,
  willRequireModeration: false,
};
beforeEach(async () => {
  sessionStorage.clear();
  for (const userId of [7, 8])
    for (const key of ["original-key", "legacy-key"])
      clearReviewImageSyncBudget({ userId, reviewId: 18 }, key);
  vi.stubGlobal("File", NodeFile);
  vi.stubGlobal("crypto", webcrypto);
  const nativeForm = await new Response("", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).formData();
  vi.stubGlobal("FormData", nativeForm.constructor);
});
it.each([0, 7])(
  "recovers original files without PATCH and preserves version %i and key",
  async (expectedVersion) => {
    const file = new File(["abc"], "one.png", { type: "image/png" });
    const pending = await createPendingImageSync(scope, expectedVersion, "original-key", [
      { kind: "new", clientId: "original-client", file, url: "" },
    ]);
    savePendingImageSyncFor(pending);
    const requests: Request[] = [];
    let sent: FormData | undefined;
    mockFetch().mockImplementation(async (input) => {
      if (!(input instanceof Request)) throw new Error("Expected Request");
      requests.push(input);
      if (input.method === "PUT") {
        sent = await input.formData();
        return json(200, {
          data: { reviewId: 18, imageVersion: expectedVersion + 1, replayed: false, images: [] },
        });
      }
      return json(200, {
        data: {
          reviewId: 18,
          expectedVersion,
          status: "WAITING_RETRY",
          retryable: true,
          updatedAt: owner.updatedAt,
        },
      });
    });
    const onOpenChange = vi.fn();
    renderWithQuery(
      <ReviewDialog
        productId={12}
        productName="Laptop"
        eligibility={{
          ...eligibility,
          existingReview: { ...owner, imageVersion: expectedVersion },
        }}
        open
        onOpenChange={onOpenChange}
      />,
    );
    expect(await screen.findByText(/cần chọn lại ảnh gốc để gửi tiếp/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeDisabled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    const select = screen.getByLabelText("Chọn lại ảnh 1: one.png");
    await waitFor(() => expect(select).toBeEnabled());
    await userEvent.upload(select, new File(["xyz"], "one.png", { type: "image/png" }));
    expect(await screen.findByText(/Ảnh không khớp file gốc/)).toBeInTheDocument();
    expect(requests.some((request) => request.method === "PUT")).toBe(false);
    await userEvent.upload(select, file);
    await waitFor(() => expect(screen.getByRole("button", { name: "Gửi tiếp ảnh" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "Gửi tiếp ảnh" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(requests.filter((request) => request.method === "PATCH")).toHaveLength(0);
    const put = requests.find((request) => request.method === "PUT")!;
    expect(put.headers.get("Idempotency-Key")).toBe("original-key");
    expect(JSON.parse(String(sent?.get("manifest")))).toEqual({
      expectedVersion,
      items: [{ kind: "new", clientId: "original-client", fileIndex: 0 }],
    });
    const uploaded = sent?.get("files");
    expect(uploaded).toBeInstanceOf(File);
    if (!uploaded || typeof uploaded === "string") throw new Error("Missing upload");
    expect(new TextDecoder().decode(await uploaded.arrayBuffer())).toBe("abc");
    expect(readPendingImageSyncFor(scope).kind).toBe("none");
  },
);

async function pendingFile() {
  const file = new File(["abc"], "one.png", { type: "image/png" });
  const pending = await createPendingImageSync(scope, 7, "original-key", [
    { kind: "new", clientId: "original-client", file, url: "" },
  ]);
  savePendingImageSyncFor(pending);
  return { file, pending };
}
it("handles HTTP 200 FAILED and reloads the owner before explicit restart without losing form input", async () => {
  await pendingFile();
  mockFetch().mockImplementation(async (input) => {
    const path = input instanceof Request ? input.url : String(input);
    if (path.includes("eligibility"))
      return json(200, { data: { ...eligibility, existingReview: { ...owner, imageVersion: 9 } } });
    return json(200, {
      data: {
        reviewId: 18,
        expectedVersion: 7,
        status: "FAILED",
        retryable: false,
        updatedAt: owner.updatedAt,
        error: { code: "REVIEW_IMAGE_VERSION_CONFLICT", message: "conflict" },
      },
    });
  });
  const close = vi.fn();
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={eligibility}
      open
      onOpenChange={close}
    />,
  );
  expect(await screen.findByText(/Ảnh đã thay đổi ở một phiên khác/)).toBeInTheDocument();
  const content = screen.getByRole("textbox", { name: "Nội dung" });
  await userEvent.clear(content);
  await userEvent.type(content, "Nội dung chỉnh sửa chưa gửi.");
  const restart = screen.getByRole("button", { name: "Bắt đầu lại với dữ liệu mới" });
  await waitFor(() => expect(restart).toBeEnabled());
  expect(close).not.toHaveBeenCalledWith(false);
  await userEvent.click(restart);
  expect(content).toHaveValue("Nội dung chỉnh sửa chưa gửi.");
  expect(screen.getByRole("radio", { name: "Công khai tên" })).toBeChecked();
  expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeEnabled();
  expect(readPendingImageSyncFor(scope).kind).toBe("none");
});
it.each([404, 503])(
  "keeps unresolved metadata and prevents a new save after status HTTP %i",
  async (status) => {
    await pendingFile();
    const fetchMock = mockFetch().mockImplementation(async (input) =>
      input instanceof Request && input.url.includes("eligibility")
        ? json(200, { data: eligibility })
        : json(status, {
            error: { code: "REVIEW_IMAGE_SYNC_OPERATION_NOT_FOUND", message: "unknown" },
          }),
    );
    const close = vi.fn();
    renderWithQuery(
      <ReviewDialog
        productId={12}
        productName="Laptop"
        eligibility={eligibility}
        open
        onOpenChange={close}
      />,
    );
    expect(
      await screen.findByText(/Không thể xác định trạng thái đồng bộ ảnh/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeDisabled();
    expect(readPendingImageSyncFor(scope).kind).toBe("current");
    expect(close).not.toHaveBeenCalledWith(false);
    expect(
      fetchMock.mock.calls.every(([input]) => input instanceof Request && input.method === "GET"),
    ).toBe(true);
  },
);
it("keeps a legacy operation when the backend rejects a different file under the original key", async () => {
  sessionStorage.setItem(
    "laptopshop:review-image-sync",
    JSON.stringify({
      productId: 12,
      reviewId: 18,
      expectedVersion: 0,
      idempotencyKey: "legacy-key",
      createdAt: 1,
      items: [
        { kind: "new", clientId: "old", fileName: "one.png", fileSize: 3, fileType: "image/png" },
      ],
    }),
  );
  let puts = 0;
  mockFetch().mockImplementation(async (input) => {
    if (input instanceof Request && input.method === "PUT") {
      puts++;
      return json(409, { error: { code: "IDEMPOTENCY_KEY_REUSED", message: "different bytes" } });
    }
    return json(200, {
      data: {
        reviewId: 18,
        expectedVersion: 0,
        status: "WAITING_RETRY",
        retryable: true,
        updatedAt: owner.updatedAt,
      },
    });
  });
  const close = vi.fn();
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={eligibility}
      open
      onOpenChange={close}
    />,
  );
  const select = await screen.findByLabelText("Chọn lại ảnh 1: one.png");
  await userEvent.upload(select, new File(["xyz"], "one.png", { type: "image/png" }));
  await userEvent.click(await screen.findByRole("button", { name: "Gửi tiếp ảnh" }));
  expect(await screen.findByText(/Ảnh không khớp file gốc/)).toBeInTheDocument();
  expect(puts).toBe(1);
  expect(close).not.toHaveBeenCalledWith(false);
  expect(readPendingImageSyncFor(scope).kind).toBe("legacy");
});
it("blocks a rebuild when an existing manifest image disappeared", async () => {
  const { pending, file } = await pendingFile();
  pending.items.unshift({ kind: "existing", clientId: "existing-99", imageId: 99 });
  savePendingImageSyncFor(pending);
  const methods: string[] = [];
  mockFetch().mockImplementation(async (input) => {
    if (input instanceof Request) methods.push(input.method);
    return json(200, {
      data: {
        reviewId: 18,
        expectedVersion: 7,
        status: "WAITING_RETRY",
        retryable: true,
        updatedAt: owner.updatedAt,
      },
    });
  });
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={eligibility}
      open
      onOpenChange={vi.fn()}
    />,
  );
  await userEvent.upload(await screen.findByLabelText("Chọn lại ảnh 1: one.png"), file);
  await userEvent.click(await screen.findByRole("button", { name: "Gửi tiếp ảnh" }));
  expect(await screen.findByText(/ảnh cũ đã thay đổi/)).toBeInTheDocument();
  expect(methods).not.toContain("PUT");
  expect(readPendingImageSyncFor(scope).kind).toBe("current");
});
async function fillNewReview() {
  await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
  await userEvent.click(screen.getByRole("radio", { name: "Công khai tên" }));
  await userEvent.type(screen.getByRole("textbox", { name: "Nội dung" }), "Nội dung mới đủ dài.");
  await userEvent.upload(
    screen.getByLabelText("Chọn ảnh"),
    new File(["abc"], "one.png", { type: "image/png" }),
  );
  await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
}
it("does not PUT when browser storage cannot preserve recovery metadata", async () => {
  const methods: string[] = [];
  mockFetch().mockImplementation(async (input) => {
    if (input instanceof Request) methods.push(input.method);
    return json(201, { data: owner });
  });
  const close = vi.fn();
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={{ ...eligibility, eligible: true, reason: null, existingReview: null }}
      open
      onOpenChange={close}
    />,
  );
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  try {
    await fillNewReview();
    expect(await screen.findByText(/Không thể lưu trạng thái ảnh/)).toBeInTheDocument();
    expect(methods).toEqual(["POST"]);
    expect(screen.getByRole("textbox", { name: "Nội dung" })).toHaveValue("Nội dung mới đủ dài.");
    expect(screen.getByRole("radio", { name: "Công khai tên" })).toBeChecked();
    expect(close).not.toHaveBeenCalledWith(false);
  } finally {
    write.mockRestore();
  }
});
it("reconciles a lost PUT response without uploading or creating the review twice", async () => {
  const methods: string[] = [];
  mockFetch().mockImplementation(async (input) => {
    if (!(input instanceof Request)) throw new Error("Request required");
    methods.push(input.method);
    if (input.method === "POST") return json(201, { data: owner });
    if (input.method === "PUT") throw new TypeError("connection lost after commit");
    return json(200, {
      data: {
        reviewId: 18,
        expectedVersion: 7,
        status: "SUCCEEDED",
        retryable: false,
        updatedAt: owner.updatedAt,
        result: { reviewId: 18, imageVersion: 8, replayed: true, images: [] },
      },
    });
  });
  const close = vi.fn();
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={{ ...eligibility, eligible: true, reason: null, existingReview: null }}
      open
      onOpenChange={close}
    />,
  );
  await fillNewReview();
  await waitFor(() => expect(close).toHaveBeenCalledWith(false));
  expect(methods.filter((value) => value === "PUT")).toHaveLength(1);
  expect(methods.filter((value) => value === "POST")).toHaveLength(1);
  expect(readPendingImageSyncFor(scope).kind).toBe("none");
});

it("allows reloading the owner after a terminal failure when the first reload was unavailable", async () => {
  await pendingFile();
  let ownerReads = 0;
  mockFetch().mockImplementation(async (input) => {
    if (input instanceof Request && input.url.includes("eligibility")) {
      ownerReads++;
      return ownerReads === 1
        ? json(503, { error: { code: "UNAVAILABLE", message: "retry" } })
        : json(200, { data: eligibility });
    }
    return json(200, {
      data: {
        reviewId: 18,
        expectedVersion: 7,
        status: "FAILED",
        retryable: false,
        updatedAt: owner.updatedAt,
        error: { code: "REVIEW_IMAGE_VERSION_CONFLICT", message: "conflict" },
      },
    });
  });
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={eligibility}
      open
      onOpenChange={vi.fn()}
    />,
  );
  expect(await screen.findByText(/chưa tải lại được dữ liệu/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra lại trạng thái ảnh" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Bắt đầu lại với dữ liệu mới" })).toBeEnabled(),
  );
  expect(ownerReads).toBe(2);
});
it("explains saved text and prevents PUT when Crypto is unavailable", async () => {
  vi.stubGlobal("crypto", {});
  const methods: string[] = [];
  mockFetch().mockImplementation(async (input) => {
    if (input instanceof Request) methods.push(input.method);
    return json(201, { data: owner });
  });
  renderWithQuery(
    <ReviewDialog
      productId={12}
      productName="Laptop"
      eligibility={{ ...eligibility, eligible: true, reason: null, existingReview: null }}
      open
      onOpenChange={vi.fn()}
    />,
  );
  await fillNewReview();
  expect(await screen.findByText(/Đánh giá đã lưu;.*xác minh ảnh gốc/)).toBeInTheDocument();
  expect(methods).toEqual(["POST"]);
  expect(screen.getByRole("textbox", { name: "Nội dung" })).toHaveValue("Nội dung mới đủ dài.");
});

it.each(["last-attempt", "after-deadline"])(
  "unlocks recovery when WAITING_RETRY arrives %s",
  async (boundary) => {
    await pendingFile();
    vi.useFakeTimers();
    let calls = 0;
    let manualWaiting = false;
    mockFetch().mockImplementation(async () => {
      calls++;
      const waiting = boundary === "last-attempt" ? calls >= 10 : manualWaiting;
      return json(200, {
        data: {
          reviewId: 18,
          expectedVersion: 7,
          status: waiting ? "WAITING_RETRY" : "PROCESSING",
          retryable: true,
          retryAfterMs: boundary === "last-attempt" ? 0 : 120000,
          updatedAt: owner.updatedAt,
        },
      });
    });
    try {
      renderWithQuery(
        <ReviewDialog
          productId={12}
          productName="Laptop"
          eligibility={eligibility}
          open
          onOpenChange={vi.fn()}
        />,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(boundary === "last-attempt" ? 25000 : 190000);
      });
      if (boundary === "after-deadline") {
        manualWaiting = true;
        fireEvent.click(screen.getByRole("button", { name: "Kiểm tra lại trạng thái ảnh" }));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(10);
        });
      }
      expect(screen.getByLabelText("Chọn lại ảnh 1: one.png")).toBeEnabled();
      expect(readPendingImageSyncFor(scope).kind).toBe("current");
    } finally {
      vi.useRealTimers();
    }
  },
);
