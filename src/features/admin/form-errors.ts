import type { FormInstance } from "antd";
import { fieldErrors } from "@/lib/api/errors";

// server-side field messages are English, so show a Vietnamese generic per field (same as src/lib/forms.ts)
export function setServerErrors(form: FormInstance, e: unknown) {
  form.setFields(Object.keys(fieldErrors(e)).map((name) => ({ name, errors: ["Giá trị không hợp lệ"] })));
}
