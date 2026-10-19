export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ErrorBody = { error?: { code?: string; message?: string; details?: unknown } };

export function toApiError(status: number, body: unknown): ApiError {
  const e = (body as ErrorBody | null | undefined)?.error;
  return new ApiError(status, e?.code ?? "UNKNOWN", e?.message ?? `HTTP ${status}`, e?.details);
}

export const isApiError = (e: unknown, code?: string): e is ApiError =>
  e instanceof ApiError && (code === undefined || e.code === code);

const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.",
  VALIDATION_ERROR: "Vui lòng kiểm tra lại thông tin đã nhập.",
  UNAUTHENTICATED: "Vui lòng đăng nhập để tiếp tục.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  EMAIL_TAKEN: "Email này đã được đăng ký.",
  OUT_OF_STOCK: "Sản phẩm không đủ số lượng trong kho.",
  CART_EMPTY: "Giỏ hàng đang trống.",
  INVALID_STATUS_TRANSITION: "Không thể thực hiện thao tác ở trạng thái hiện tại của đơn hàng.",
  NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  FORBIDDEN_ORIGIN: "Yêu cầu bị từ chối.",
  INVALID_FILE: "Chỉ chấp nhận ảnh JPEG hoặc PNG.",
  PRODUCT_IN_USE: "Sản phẩm đã có trong đơn hàng nên không thể xoá. Hãy ẩn sản phẩm.",
  PRODUCT_UNAVAILABLE: "Sản phẩm đã ngừng kinh doanh.",
  USER_HAS_ORDERS: "Người dùng đã có đơn hàng nên không thể xoá.",
  CANNOT_CHANGE_OWN_ROLE: "Bạn không thể đổi vai trò của chính mình.",
  CANNOT_DELETE_SELF: "Bạn không thể xoá tài khoản của chính mình.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
};

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (MESSAGES[e.code]) return MESSAGES[e.code];
    if (e.status === 429) return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
    if (e.status >= 500) return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export function fieldErrors(e: unknown): Record<string, string> {
  if (!isApiError(e, "VALIDATION_ERROR") || !Array.isArray(e.details)) return {};
  const entries = (e.details as Array<{ path?: unknown; message?: unknown }>)
    .filter((d) => typeof d?.path === "string" && d.path)
    .map((d) => [d.path as string, String(d.message ?? "")]);
  return Object.fromEntries(entries);
}

type Result<T> = { data?: T; error?: unknown; response: Response };

export async function unwrap<T>(promise: Promise<Result<T>>): Promise<T> {
  let result: Result<T>;
  try {
    result = await promise;
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network error");
  }
  if (result.error !== undefined || !result.response.ok) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as T;
}
