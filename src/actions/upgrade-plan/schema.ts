import { z } from "zod";

export const upgradePlanSchema = z.object({
  planSlug: z.string().min(1, "Plano é obrigatório"),
  stripePriceId: z.string().optional(),
});
