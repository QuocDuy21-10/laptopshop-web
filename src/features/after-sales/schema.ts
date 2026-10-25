import { z } from "zod";

export const createServiceRequestSchema = z.object({
  type: z.enum(["WARRANTY", "TECHNICAL_SUPPORT"]),
  subject: z.string().trim().min(1).max(200),
  previousRequestId: z.number().int().positive().optional(),
  items: z.array(z.object({
    orderDetailId: z.number().int().positive(),
    deviceLabel: z.string().trim().min(1).max(100),
    serialNumber: z.string().trim().min(1).max(100).optional(),
    issueDescription: z.string().trim().min(1).max(5000),
  })).min(1).max(50),
});

export type CreateServiceRequestForm = z.infer<typeof createServiceRequestSchema>;
