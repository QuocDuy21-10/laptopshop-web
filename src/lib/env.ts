import "server-only";
import { z } from "zod";

export const env = z
  .object({ API_ORIGIN: z.url().default("http://localhost:8080") })
  .parse({ API_ORIGIN: process.env.API_ORIGIN });
