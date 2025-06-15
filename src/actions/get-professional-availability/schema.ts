import { z } from "zod";

export const getProfessionalAvailabilitySchema = z.object({
  professionalId: z.string().uuid(),
});
