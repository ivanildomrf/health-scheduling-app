import { z } from "zod";

export const createChatConversationSchema = z.object({
  patientId: z.string().uuid("ID do paciente deve ser um UUID válido"),
  subject: z
    .string()
    .min(3, "Assunto deve ter pelo menos 3 caracteres")
    .max(200, "Assunto deve ter no máximo 200 caracteres"),
  priority: z.number().int().min(1).max(3).optional(),
  initialMessage: z.string().optional(),
});

export type CreateChatConversationInput = z.infer<
  typeof createChatConversationSchema
>;
