import { z } from "zod";

export const getPatientConversationsSchema = z.object({
  patientId: z.string().uuid("ID do paciente deve ser um UUID válido"),
});

export type GetPatientConversationsInput = z.infer<
  typeof getPatientConversationsSchema
>;
