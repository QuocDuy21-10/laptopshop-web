import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { fieldErrors } from "@/lib/api/errors";

// server-side field messages are English, so show a Vietnamese generic per field
export function applyFieldErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): boolean {
  const fields = Object.keys(fieldErrors(err));
  for (const name of fields) setError(name as Path<T>, { message: "Giá trị không hợp lệ" });
  return fields.length > 0;
}
