"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ApiError, errorMessage, unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { OwnerReview, ReviewImageSyncResult } from "@/lib/api/types";
import { useCreateReview, useUpdateReview, useSyncReviewImages } from "./hooks";
import { useBoundedReviewImageSyncStatus } from "./useBoundedReviewImageSyncStatus";
import {
  createPendingImageSync,
  savePendingImageSyncFor,
  clearPendingImageSyncFor,
  readPendingImageSyncFor,
  PendingImageSyncStorageError,
  ReviewImageVerificationError,
  type RecoverableImageSync,
} from "./pending-image-sync";
import { rebuildRecoveryDraft, verifyRecoveryFile } from "./review-image-recovery";
import type { ReviewImagesState } from "./ReviewImagesEditor/ReviewImagesEditor";
import type { ReviewInput } from "./schema";

type Phase =
  | "IDLE"
  | "SAVING_REVIEW"
  | "SYNCING_IMAGES"
  | "RECONCILING"
  | "WAITING_FILES"
  | "WAITING_RETRY"
  | "FAILED"
  | "UNKNOWN"
  | "COMPLETED";
type State = {
  activeReview: OwnerReview | null;
  imageState: ReviewImagesState;
  phase: Phase;
  imageError: string | null;
  pending: RecoverableImageSync | null;
  recoveryFiles: Map<string, File>;
  invalidClientIds: string[];
  legacyConfirmed: boolean;
  freshOwner: OwnerReview | null;
  restartReady: boolean;
  sessionId: number;
};
const draftImages = (review: OwnerReview | null): ReviewImagesState =>
  review?.images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })) ??
  [];
const initial = (review: OwnerReview | null): State => ({
  activeReview: review,
  imageState: draftImages(review),
  phase: "IDLE",
  imageError: null,
  pending: null,
  recoveryFiles: new Map(),
  invalidClientIds: [],
  legacyConfirmed: false,
  freshOwner: null,
  restartReady: false,
  sessionId: 0,
});
type Action =
  | { type: "patch"; value: Partial<State> }
  | { type: "file"; clientId: string; file: File; valid: boolean }
  | { type: "selecting"; clientId: string }
  | { type: "success"; result: ReviewImageSyncResult };
function reducer(state: State, action: Action): State {
  if (action.type === "patch") return { ...state, ...action.value };
  if (action.type === "success") {
    const images = action.result.images.map(({ clientId, ...image }) => {
      void clientId;
      return image;
    });
    return {
      ...state,
      activeReview: state.activeReview
        ? { ...state.activeReview, imageVersion: action.result.imageVersion, images }
        : null,
      imageState: images.map((image) => ({
        kind: "existing",
        clientId: `existing-${image.id}`,
        image,
      })),
      pending: null,
      recoveryFiles: new Map(),
      invalidClientIds: [],
      phase: "IDLE",
      imageError: null,
    };
  }
  const files = new Map(state.recoveryFiles);
  let invalid = state.invalidClientIds.filter((id) => id !== action.clientId);
  if (action.type === "selecting") files.delete(action.clientId);
  else {
    files.set(action.clientId, action.file);
    if (!action.valid) invalid = [...invalid, action.clientId];
  }
  const ready = state.pending?.items.every(
    (item) =>
      item.kind === "existing" || (files.has(item.clientId) && !invalid.includes(item.clientId)),
  );
  return {
    ...state,
    recoveryFiles: files,
    invalidClientIds: invalid,
    phase: ready ? "WAITING_RETRY" : "WAITING_FILES",
  };
}
const failureMessage = (code?: string) =>
  code === "REVIEW_IMAGE_VERSION_CONFLICT" || code === "REVIEW_IMAGE_SET_CHANGED"
    ? "Ảnh đã thay đổi ở một phiên khác. Hãy tải lại dữ liệu trước khi gửi lại."
    : code === "REVIEW_NOT_FOUND"
      ? "Đánh giá không còn tồn tại. Hãy tải lại dữ liệu."
      : "Thao tác ảnh đã thất bại. Hãy tải lại dữ liệu trước khi gửi lại.";

export function useReviewImageSyncWorkflow({
  productId,
  userId,
  existingReview,
  open,
  onCompleted,
}: {
  productId: number;
  userId?: number;
  existingReview: OwnerReview | null;
  open: boolean;
  onCompleted: () => void;
}) {
  const [state, dispatch] = useReducer(reducer, existingReview, initial);
  const client = useQueryClient();
  const generation = useRef(0);
  const checks = useRef(new Map<string, number>());
  const wasOpen = useRef(open);
  const create = useCreateReview(productId, userId);
  const update = useUpdateReview(productId, state.activeReview?.id ?? 0, userId);
  const sync = useSyncReviewImages(productId, userId);
  const status = useBoundedReviewImageSyncStatus({
    scope: { userId: userId ?? 0, productId, reviewId: state.activeReview?.id ?? 0 },
    idempotencyKey: state.pending?.idempotencyKey,
    enabled:
      open &&
      Boolean(state.pending) &&
      !["IDLE", "SAVING_REVIEW", "SYNCING_IMAGES", "FAILED"].includes(state.phase),
  });
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );
  useEffect(() => {
    const changedTarget =
      existingReview && state.activeReview && existingReview.id !== state.activeReview.id;
    if ((open && !wasOpen.current && state.phase === "IDLE" && !state.pending) || changedTarget) {
      generation.current += 1;
      dispatch({
        type: "patch",
        value: { ...initial(existingReview), sessionId: state.sessionId + 1 },
      });
    }
    wasOpen.current = open;
    if (!open && state.pending)
      dispatch({ type: "patch", value: { imageState: draftImages(state.activeReview) } });
  }, [open, existingReview, state.activeReview, state.phase, state.pending, state.sessionId]);
  useEffect(() => {
    if (!open || !userId || !state.activeReview || state.phase !== "IDLE" || state.pending) return;
    const read = readPendingImageSyncFor({ userId, productId, reviewId: state.activeReview.id });
    if (read.kind === "current" || read.kind === "legacy")
      dispatch({ type: "patch", value: { pending: read.value, phase: "RECONCILING" } });
    else if (read.kind === "invalid" || read.kind === "storage-error")
      dispatch({ type: "patch", value: { phase: "UNKNOWN", imageError: read.reason } });
  }, [open, userId, productId, state.activeReview, state.phase, state.pending]);
  const loadOwner = useCallback(async () => {
    if (!userId) return null;
    const eligibility = await client.fetchQuery({
      queryKey: queryKeys.reviewEligibility(productId, userId),
      staleTime: 0,
      queryFn: async () =>
        (
          await unwrap(
            api.GET("/api/v1/products/{id}/reviews/eligibility", {
              params: { path: { id: productId } },
            }),
          )
        ).data,
    });
    return eligibility.existingReview;
  }, [client, productId, userId]);
  const complete = useCallback(
    (pending: RecoverableImageSync, result: ReviewImageSyncResult) => {
      if (!userId) return;
      try {
        clearPendingImageSyncFor(
          { userId, productId, reviewId: pending.reviewId },
          pending.idempotencyKey,
        );
      } catch {
        dispatch({
          type: "patch",
          value: {
            phase: "COMPLETED",
            imageError:
              "Ảnh đã lưu nhưng chưa xóa được dấu chờ trong trình duyệt. Hãy kiểm tra lại.",
          },
        });
        return;
      }
      dispatch({ type: "success", result });
      void client.invalidateQueries({ queryKey: queryKeys.reviews(productId) });
      void client.invalidateQueries({ queryKey: queryKeys.reviewImages(result.reviewId) });
      onCompleted();
    },
    [client, productId, userId, onCompleted],
  );
  useEffect(() => {
    if (!open || !state.pending) return;
    const pending = state.pending;
    const data = status.data;
    if (data?.status === "SUCCEEDED" && data.result) {
      complete(pending, data.result);
      return;
    }
    if (status.isError || status.timedOut) {
      dispatch({
        type: "patch",
        value: {
          phase: "UNKNOWN",
          imageError:
            "Không thể xác định trạng thái đồng bộ ảnh; hãy kiểm tra lại trước khi thử lại.",
        },
      });
      if (status.error instanceof ApiError && status.error.status === 404) {
        const token = generation.current;
        void loadOwner()
          .then((owner) => {
            if (generation.current === token && (!owner || owner.deletedAt))
              dispatch({
                type: "patch",
                value: {
                  imageError:
                    "Đánh giá không còn tồn tại; trạng thái ảnh chưa được xác nhận. Bạn có thể đóng hộp thoại.",
                },
              });
          })
          .catch(() => undefined);
      }
      return;
    }
    if (data?.status === "FAILED") {
      dispatch({
        type: "patch",
        value: {
          phase: "FAILED",
          imageError: failureMessage(data.error?.code),
          restartReady: false,
        },
      });
      const token = generation.current;
      void loadOwner()
        .then((owner) => {
          if (generation.current === token)
            dispatch({
              type: "patch",
              value: { freshOwner: owner, restartReady: Boolean(owner && !owner.deletedAt) },
            });
        })
        .catch(() => {
          if (generation.current === token)
            dispatch({
              type: "patch",
              value: {
                imageError:
                  "Thao tác ảnh đã thất bại; chưa tải lại được dữ liệu. Hãy thử kiểm tra lại.",
              },
            });
        });
    } else if (data?.status === "WAITING_RETRY") {
      const ready = pending.items.every(
        (item) =>
          item.kind === "existing" ||
          (state.recoveryFiles.has(item.clientId) &&
            !state.invalidClientIds.includes(item.clientId)),
      );
      dispatch({
        type: "patch",
        value: {
          phase: ready ? "WAITING_RETRY" : "WAITING_FILES",
          legacyConfirmed: true,
          imageError: "Đánh giá đã lưu; ảnh đang chờ bạn thử lại cùng thao tác.",
        },
      });
    } else if (data?.status === "PROCESSING")
      dispatch({
        type: "patch",
        value: {
          phase: "RECONCILING",
          imageError: "Đánh giá đã lưu; đang kiểm tra trạng thái ảnh để retry an toàn.",
        },
      });
  }, [
    open,
    state.pending,
    state.recoveryFiles,
    state.invalidClientIds,
    status.data,
    status.error,
    status.isError,
    status.timedOut,
    complete,
    loadOwner,
  ]);

  const upload = async (
    pending: RecoverableImageSync,
    items: ReviewImagesState,
    isNew: boolean,
  ) => {
    const token = generation.current;
    dispatch({ type: "patch", value: { phase: "SYNCING_IMAGES", imageError: null } });
    try {
      const result = await sync.mutateAsync({
        reviewId: pending.reviewId,
        expectedVersion: pending.expectedVersion,
        idempotencyKey: pending.idempotencyKey,
        items,
      });
      if (generation.current === token) complete(pending, result);
    } catch (error) {
      if (generation.current !== token) return;
      if (error instanceof ApiError && error.code === "IDEMPOTENCY_KEY_REUSED") {
        dispatch({
          type: "patch",
          value: {
            phase: "WAITING_FILES",
            invalidClientIds: pending.items.flatMap((item) =>
              item.kind === "new" ? [item.clientId] : [],
            ),
            imageError: "Ảnh chọn lại không khớp thao tác gốc. Hãy chọn lại đúng file.",
          },
        });
      } else if (
        isNew &&
        error instanceof ApiError &&
        [
          "REVIEW_IMAGE_INVALID_FILE",
          "REVIEW_IMAGE_TOO_LARGE",
          "REVIEW_IMAGE_SYNC_MANIFEST_INVALID",
          "IDEMPOTENCY_KEY_REQUIRED",
        ].includes(error.code) &&
        userId
      ) {
        try {
          clearPendingImageSyncFor(
            { userId, productId, reviewId: pending.reviewId },
            pending.idempotencyKey,
          );
          dispatch({
            type: "patch",
            value: { pending: null, phase: "IDLE", imageError: errorMessage(error) },
          });
        } catch {
          dispatch({
            type: "patch",
            value: { phase: "UNKNOWN", imageError: new PendingImageSyncStorageError().message },
          });
        }
      } else
        dispatch({
          type: "patch",
          value: {
            phase: "RECONCILING",
            imageError: "Đánh giá đã lưu; đang kiểm tra trạng thái ảnh để retry an toàn.",
          },
        });
    }
  };
  const submit = async (input: ReviewInput) => {
    if (state.phase !== "IDLE" || state.pending || !userId) return;
    const token = generation.current;
    let savedText = false;
    dispatch({ type: "patch", value: { phase: "SAVING_REVIEW", imageError: null } });
    try {
      const saved = (
        state.activeReview ? await update.mutateAsync(input) : await create.mutateAsync(input)
      ).data;
      if (generation.current !== token) return;
      savedText = true;
      dispatch({ type: "patch", value: { activeReview: saved } });
      if (!state.imageState.length && !saved.images.length) {
        dispatch({ type: "patch", value: { phase: "IDLE" } });
        onCompleted();
        return;
      }
      const pending = await createPendingImageSync(
        { userId, productId, reviewId: saved.id },
        saved.imageVersion,
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        state.imageState,
      );
      if (generation.current !== token) return;
      savePendingImageSyncFor(pending);
      const files = new Map(
        state.imageState.flatMap((item) =>
          item.kind === "new" ? [[item.clientId, item.file] as const] : [],
        ),
      );
      dispatch({ type: "patch", value: { pending, recoveryFiles: files, invalidClientIds: [] } });
      await upload(pending, state.imageState, true);
    } catch (error) {
      if (generation.current !== token) return;
      const message =
        error instanceof PendingImageSyncStorageError ||
        error instanceof ReviewImageVerificationError
          ? error.message
          : errorMessage(error);
      dispatch({
        type: "patch",
        value: { phase: "IDLE", imageError: savedText ? `Đánh giá đã lưu; ${message}` : message },
      });
      throw error;
    }
  };
  const selectRecoveryFile = async (clientId: string, file: File) => {
    const pending = state.pending;
    if (!pending) return;
    const item = pending.items.find((candidate) => candidate.clientId === clientId);
    if (item?.kind !== "new" || !["WAITING_FILES", "WAITING_RETRY"].includes(state.phase)) return;
    const token = generation.current;
    const sequence = (checks.current.get(clientId) ?? 0) + 1;
    checks.current.set(clientId, sequence);
    dispatch({ type: "selecting", clientId });
    try {
      let valid = false;
      if ("schemaVersion" in pending) {
        const original = pending.items.find((candidate) => candidate.clientId === clientId);
        if (original?.kind === "new") valid = await verifyRecoveryFile(original, file);
      } else
        valid = state.legacyConfirmed && item.fileSize === file.size && item.fileType === file.type;
      if (generation.current === token && checks.current.get(clientId) === sequence)
        dispatch({ type: "file", clientId, file, valid });
    } catch {
      if (generation.current === token)
        dispatch({
          type: "patch",
          value: { imageError: "Không thể xác minh ảnh gốc. Hãy dùng kết nối bảo mật và thử lại." },
        });
    }
  };
  const retryImages = async () => {
    if (!state.pending || !state.activeReview || state.phase !== "WAITING_RETRY") return;
    dispatch({ type: "patch", value: { phase: "SYNCING_IMAGES" } });
    const token = generation.current;
    try {
      const rebuilt = await rebuildRecoveryDraft(
        state.pending,
        state.recoveryFiles,
        state.activeReview.images,
        state.legacyConfirmed,
      );
      if (generation.current !== token) return;
      if (!rebuilt.ready) {
        dispatch({
          type: "patch",
          value: {
            phase: rebuilt.missingImageIds.length ? "UNKNOWN" : "WAITING_FILES",
            imageError: "Chưa đủ ảnh gốc hoặc ảnh cũ đã thay đổi. Hãy kiểm tra lại dữ liệu.",
          },
        });
        return;
      }
      await upload(state.pending, rebuilt.items, false);
    } catch {
      if (generation.current === token)
        dispatch({
          type: "patch",
          value: {
            phase: "WAITING_FILES",
            imageError: "Không thể xác minh ảnh gốc. Hãy chọn lại ảnh và thử lại.",
          },
        });
    }
  };
  const restart = () => {
    if (
      state.phase !== "FAILED" ||
      !state.restartReady ||
      !state.freshOwner ||
      !userId ||
      !state.pending
    )
      return;
    try {
      clearPendingImageSyncFor(
        { userId, productId, reviewId: state.pending.reviewId },
        state.pending.idempotencyKey,
      );
    } catch {
      dispatch({
        type: "patch",
        value: { imageError: new PendingImageSyncStorageError().message },
      });
      return;
    }
    dispatch({
      type: "patch",
      value: {
        activeReview: state.freshOwner,
        imageState: draftImages(state.freshOwner),
        pending: null,
        phase: "IDLE",
        imageError: null,
        recoveryFiles: new Map(),
        invalidClientIds: [],
      },
    });
  };
  const checkAgain = async () => {
    if (state.phase === "FAILED") {
      const token = generation.current;
      dispatch({ type: "patch", value: { restartReady: false } });
      try {
        const owner = await loadOwner();
        if (generation.current === token)
          dispatch({
            type: "patch",
            value: {
              freshOwner: owner,
              restartReady: Boolean(owner && !owner.deletedAt),
              imageError: failureMessage(status.data?.error?.code),
            },
          });
      } catch {
        if (generation.current === token)
          dispatch({
            type: "patch",
            value: {
              imageError:
                "Thao tác ảnh đã thất bại; chưa tải lại được dữ liệu. Hãy thử kiểm tra lại.",
            },
          });
      }
      return;
    }
    if (!state.pending && state.activeReview && userId) {
      const read = readPendingImageSyncFor({ userId, productId, reviewId: state.activeReview.id });
      if (read.kind === "current" || read.kind === "legacy")
        dispatch({ type: "patch", value: { pending: read.value, phase: "RECONCILING" } });
      else
        dispatch({
          type: "patch",
          value: {
            imageError:
              read.kind === "invalid" || read.kind === "storage-error"
                ? read.reason
                : "Chưa tìm thấy trạng thái thao tác ảnh. Hãy kiểm tra lại dữ liệu.",
          },
        });
      return;
    }
    await status.checkAgain();
  };
  const busy = state.phase === "SAVING_REVIEW" || state.phase === "SYNCING_IMAGES";
  return {
    ...state,
    busy,
    imagesLocked: state.phase !== "IDLE",
    submitDisabled: state.phase !== "IDLE",
    setImageState: (imageState: ReviewImagesState) => {
      if (state.phase === "IDLE") dispatch({ type: "patch", value: { imageState } });
    },
    submit,
    selectRecoveryFile,
    retryImages,
    restart,
    checkAgain,
    reviewDeleted: () => {
      generation.current += 1;
      dispatch({ type: "patch", value: { ...initial(null), sessionId: state.sessionId + 1 } });
    },
  };
}
