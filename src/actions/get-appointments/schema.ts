import { z } from "zod";

export const getAppointmentsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(10).max(30).default(10),
  clinicId: z.string().uuid(),
});

export type GetAppointmentsInput = z.infer<typeof getAppointmentsSchema>;
