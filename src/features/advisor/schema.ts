import { z } from "zod";
import type { AdvisorRequest, AdvisorResult } from "@/lib/api/types";

const priorities = z.enum(["PERFORMANCE", "PORTABILITY", "BATTERY", "DISPLAY", "VALUE"]);
const workloads = z.enum(["DOCKER_VM", "ESPORTS", "AAA_GAMING", "PHOTO_VIDEO", "CAD_3D"]);
const unique = (items: readonly string[]) => new Set(items).size === items.length;

export const advisorFormSchema = z
  .object({
    budgetMax: z.coerce.number().int().min(5_000_000, "Ngân sách tối thiểu là 5 triệu đồng").max(200_000_000),
    usage: z.enum(["CODING", "GAMING", "OFFICE", "CREATIVE"], "Vui lòng chọn nhu cầu chính"),
    priorities: z.array(priorities).max(3, "Chỉ chọn tối đa 3 ưu tiên").refine(unique, "Không chọn trùng ưu tiên"),
    minRamGb: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.union([z.literal(8), z.literal(16), z.literal(32)]).optional(),
    ),
    workloads: z.array(workloads).max(5).refine(unique, "Không chọn trùng tác vụ").default([]),
    note: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional(),
    ),
  })
  .strict();

export type AdvisorFormInput = z.input<typeof advisorFormSchema>;
export type AdvisorFormOutput = z.output<typeof advisorFormSchema>;
export type AdvisorApiInput = AdvisorRequest;
export type AdvisorApiResult = AdvisorResult;
