import { z } from "zod";

export const archiveConversationSchema = z.object({
  conversationId: z.string().uuid("ID da conversa deve ser um UUID válido"),
  reason: z.string().optional(),
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});
